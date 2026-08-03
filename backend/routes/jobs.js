const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');

// GET /api/jobs - List jobs with search, filtering, and pagination
router.get('/', async (req, res) => {
  try {
    const { search, site, location, limit = 50, page = 1, sortBy = 'scraped_at', resultsWanted } = req.query;

    const query = {};

    // Only show jobs scraped in the last 72 hours
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    query.scraped_at = { $gte: cutoff };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { search_term: { $regex: search, $options: 'i' } }
      ];
    }

    if (site && site !== 'all') {
      query.site = { $regex: site, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const parsedLimit = resultsWanted ? parseInt(resultsWanted) : parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const sortOption = {};
    if (sortBy === 'title') sortOption.title = 1;
    else if (sortBy === 'company') sortOption.company = 1;
    else if (sortBy === 'date') sortOption.createdAt = -1;
    else sortOption.scraped_at = -1;

    const jobs = await Job.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs/stats - Get stats breakdown
router.get('/stats', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    
    const siteStats = await Job.aggregate([
      { $group: { _id: '$site', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topCompanies = await Job.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const recentCount = await Job.countDocuments({
      scraped_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      stats: {
        totalJobs,
        recent24h: recentCount,
        siteStats,
        topCompanies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scrape - Trigger Python scraper
router.post('/scrape', async (req, res) => {
  try {
    const {
      search_term = 'software engineer',
      location = 'San Francisco, CA',
      country = 'USA',
      google_query = '',
      results_wanted = 20,
      hours_old = 72,
      sites = ['indeed', 'linkedin'],
      only_no_experience = false
    } = req.body;

    const pythonScript = path.join(__dirname, '../scraper/scraper.py');
    const rootCsvPath = path.join(__dirname, '../../../jobs.csv');

    const siteArg = Array.isArray(sites) ? sites.join(',') : sites;

    const args = [
      pythonScript,
      '--search_term', search_term,
      '--location', location,
      '--country', country,
      '--results_wanted', String(results_wanted),
      '--hours_old', String(hours_old),
      '--sites', siteArg,
      '--csv_path', rootCsvPath
    ];

    if (google_query) {
      args.push('--google_query', google_query);
    }

    if (only_no_experience) {
      args.push('--only_no_experience');
    }

    console.log('Spawning Python scraper:', 'python', args.join(' '));

    // Try 'python' or 'python3' command
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const pyProcess = spawn(pythonCmd, args);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', async (code) => {
      console.log(`Python process exited with code ${code}`);
      if (stderrData) {
        console.warn(`Python process stderr: ${stderrData}`);
      }

      try {
        let scrapedJobs = [];
        if (stdoutData.trim()) {
          scrapedJobs = JSON.parse(stdoutData);
        }

        let savedCount = 0;
        let updatedCount = 0;

        for (const job of scrapedJobs) {
          const jobUrl = job.job_url || job.url || job.link || job.job_post_url;
          if (!jobUrl) continue;

          const jobData = {
            title: job.title || job.job_title || 'Untitled Job',
            company: job.company || job.company_name || 'Unknown Company',
            location: job.location || location || 'Remote / Not specified',
            job_url: jobUrl,
            site: job.site || job.source || 'web',
            description: job.description || job.summary || '',
            job_type: job.job_type || '',
            date_posted: job.date_posted || '',
            min_amount: typeof job.min_amount === 'number' ? job.min_amount : null,
            max_amount: typeof job.max_amount === 'number' ? job.max_amount : null,
            currency: job.currency || '',
            interval: job.interval || '',
            is_remote: job.is_remote === true,
            search_term,
            country,
            scraped_at: new Date()
          };

          const result = await Job.updateOne(
            { job_url: jobUrl },
            { $set: jobData },
            { upsert: true }
          );

          if (result.upsertedCount > 0) savedCount++;
          else if (result.modifiedCount > 0) updatedCount++;
        }

        // Also ensure jobs.csv in root is updated with all links in DB if missing
        const allJobs = await Job.find({}, 'job_url');
        const csvContent = allJobs.map(j => j.job_url).join('\n') + '\n';
        fs.writeFileSync(rootCsvPath, csvContent, 'utf-8');

        res.json({
          success: true,
          message: `Scraped ${scrapedJobs.length} jobs. ${savedCount} new jobs added, ${updatedCount} updated.`,
          scrapedCount: scrapedJobs.length,
          savedCount,
          updatedCount,
          jobs: scrapedJobs
        });

      } catch (err) {
        console.error('Failed to parse Python output or save to MongoDB:', err);
        res.status(500).json({
          success: false,
          error: `Error processing scraper output: ${err.message}`,
          rawOutput: stdoutData,
          stderr: stderrData
        });
      }
    });

    pyProcess.on('error', (err) => {
      console.error('Failed to start python process:', err);
      res.status(500).json({
        success: false,
        error: `Failed to launch Python: ${err.message}`
      });
    });

  } catch (error) {
    console.error('Scrape route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/jobs - Clear all jobs
router.delete('/', async (req, res) => {
  try {
    await Job.deleteMany({});
    const rootCsvPath = path.join(__dirname, '../../../jobs.csv');
    if (fs.existsSync(rootCsvPath)) {
      fs.writeFileSync(rootCsvPath, '', 'utf-8');
    }
    res.json({ success: true, message: 'All jobs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete single job
router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes in this file require authentication
router.use(authMiddleware);

// POST /api/saved-jobs — Save a job to the user's collection
router.post('/', async (req, res) => {
  try {
    const { jobId, title, company, location, job_url, site, description, salary, date_posted, is_remote } = req.body;

    if (!jobId || !job_url) {
      return res.status(400).json({
        success: false,
        error: 'jobId and job_url are required.'
      });
    }

    // Check if already saved
    const existing = await SavedJob.findOne({ userId: req.user.id, jobId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'This job is already saved.',
        savedJob: existing
      });
    }

    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

    const savedJob = await SavedJob.create({
      userId: req.user.id,
      jobId,
      title: title || 'Untitled Job',
      company: company || 'Unknown Company',
      location: location || 'Not specified',
      job_url,
      site: site || 'web',
      description: description || '',
      salary: salary || '',
      date_posted: date_posted || '',
      is_remote: is_remote || false,
      savedAt: new Date(),
      expiresAt: new Date(Date.now() + THREE_DAYS_MS)
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully. It will be automatically removed after 3 days.',
      savedJob
    });
  } catch (error) {
    console.error('Save job error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'This job is already saved.'
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/saved-jobs — List all saved jobs for the authenticated user
router.get('/', async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user.id })
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      count: savedJobs.length,
      data: savedJobs
    });
  } catch (error) {
    console.error('Fetch saved jobs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/saved-jobs/check/:jobId — Check if a specific job is saved
router.get('/check/:jobId', async (req, res) => {
  try {
    const saved = await SavedJob.findOne({
      userId: req.user.id,
      jobId: req.params.jobId
    });

    res.json({
      success: true,
      isSaved: !!saved,
      savedJob: saved || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/saved-jobs/:id — Remove a saved job
router.delete('/:id', async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id  // Ensure user can only delete their own saves
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        error: 'Saved job not found or already removed.'
      });
    }

    res.json({
      success: true,
      message: 'Job removed from saved list.'
    });
  } catch (error) {
    console.error('Delete saved job error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

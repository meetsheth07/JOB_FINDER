import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import StatsPanel from './components/StatsPanel';
import FilterBar from './components/FilterBar';
import JobList from './components/JobList';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isMongoConnected, setIsMongoConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');
  const [sortBy, setSortBy] = useState('scraped_at');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Scraper status
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        sortBy,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedSite !== 'all') params.append('site', selectedSite);

      const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setJobs(data.data);
        setPagination(data.pagination);
        setIsMongoConnected(true);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('API Connection error:', err);
      setIsMongoConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedSite, sortBy]);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

  const handleScrape = async (formData) => {
    setIsScraping(true);
    setScrapeStatus({ error: false, message: 'Launching Python scraper background process...' });

    try {
      const res = await fetch(`${API_BASE}/jobs/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setScrapeStatus({
          error: false,
          message: data.message || `Successfully scraped ${data.scrapedCount} jobs!`
        });
        fetchJobs();
        fetchStats();
      } else {
        setScrapeStatus({
          error: true,
          message: data.error || 'Scrape failed to complete.'
        });
      }
    } catch (err) {
      setScrapeStatus({
        error: true,
        message: `Network/Server Error: ${err.message}`
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== id));
        fetchStats();
      }
    } catch (err) {
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setJobs([]);
        fetchStats();
      }
    } catch (err) {
      alert(`Failed to clear database: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      <Header
        isMongoConnected={isMongoConnected}
        onRefresh={() => { fetchJobs(); fetchStats(); }}
        totalCount={pagination ? pagination.total : jobs.length}
      />

      <StatsPanel stats={stats} />

      <SearchForm
        onScrape={handleScrape}
        isScraping={isScraping}
        scrapeStatus={scrapeStatus}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(1); }}
        selectedSite={selectedSite}
        onSiteChange={(val) => { setSelectedSite(val); setPage(1); }}
        sortBy={sortBy}
        onSortChange={(val) => setSortBy(val)}
        onClearAll={handleClearAll}
        totalJobs={pagination ? pagination.total : jobs.length}
      />

      <JobList
        jobs={jobs}
        onDeleteJob={handleDeleteJob}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoading}
      />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import StatsPanel from './components/StatsPanel';
import FilterBar from './components/FilterBar';
import JobList from './components/JobList';
import AuthPage from './components/AuthPage';
import SavedJobsPage from './components/SavedJobsPage';
import LandingPage from './components/LandingPage';
import API_BASE from './config.js';

// Guard: only accessible when logged in
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-loading"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

// Guard: redirect to home if already logged in
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-loading"><div className="spinner" /></div>;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

// Landing or App based on auth state
function LandingOrApp() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-loading"><div className="spinner" /></div>;
  return isAuthenticated ? <HomePage /> : <LandingPage />;
}

function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
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
  const [resultsWanted, setResultsWanted] = useState(20);

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
        sortBy,
        resultsWanted: String(resultsWanted),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedSite !== 'all') params.append('site', selectedSite);

      const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setJobs(data.data);
        setPagination(data.pagination);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('API Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedSite, sortBy, resultsWanted]);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

  const handleScrape = async (formData) => {
    setIsScraping(true);
    setScrapeStatus({ error: false, message: 'Searching for jobs, please wait...' });
    // Update the display limit to match user's request
    if (formData.results_wanted) {
      setResultsWanted(formData.results_wanted);
    }

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
          message: `Found ${data.scrapedCount} jobs! ${data.savedCount} new results added.`
        });
        fetchJobs();
        fetchStats();
      } else {
        setScrapeStatus({
          error: true,
          message: data.error || 'Search failed. Please try again.'
        });
      }
    } catch (err) {
      setScrapeStatus({
        error: true,
        message: `Connection Error: ${err.message}`
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
    <>
      <Header
        onRefresh={() => { fetchJobs(); fetchStats(); }}
        totalCount={pagination ? pagination.total : jobs.length}
      />

      <div className="app-container">
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingOrApp />} />
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

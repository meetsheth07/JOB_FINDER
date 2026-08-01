import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, ExternalLink, MapPin, Building, Calendar, Clock,
  Trash2, AlertTriangle, Briefcase, ArrowLeft
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function getTimeRemaining(expiresAt) {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0) return { expired: true, text: 'Expired', percent: 0 };

  const totalMs = 3 * 24 * 60 * 60 * 1000;
  const percent = Math.max(0, Math.min(100, (diff / totalMs) * 100));

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  if (days > 0) text = `${days}d ${hours}h remaining`;
  else if (hours > 0) text = `${hours}h ${minutes}m remaining`;
  else text = `${minutes}m remaining`;

  return { expired: false, text, percent };
}

export default function SavedJobsPage() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setTick] = useState(0); // Force re-render for countdown

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const fetchSavedJobs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/saved-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSavedJobs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUnsave = async (savedJobId) => {
    try {
      const res = await fetch(`${API_BASE}/saved-jobs/${savedJobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSavedJobs(prev => prev.filter(j => j._id !== savedJobId));
      }
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-header">
        <div className="saved-jobs-title-row">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            Back to Search
          </button>
          <div>
            <h2 className="saved-jobs-title">
              <Bookmark size={24} />
              My Saved Jobs
            </h2>
            <p className="saved-jobs-subtitle">
              {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved • Auto-deleted after 3 days
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="saved-jobs-loading">
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p>Loading saved jobs...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="saved-jobs-empty glass-panel">
          <Briefcase size={48} style={{ color: 'var(--text-dim)', marginBottom: 16 }} />
          <h3>No saved jobs yet</h3>
          <p>Browse job listings and click the bookmark icon to save jobs you're interested in.</p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {savedJobs.map((job) => {
            const remaining = getTimeRemaining(job.expiresAt);
            const urgencyClass = remaining.percent < 20 ? 'urgent' : remaining.percent < 50 ? 'warning' : '';

            return (
              <div key={job._id} className="glass-panel saved-job-card">
                <div className="saved-job-countdown-bar">
                  <div
                    className={`saved-job-countdown-fill ${urgencyClass}`}
                    style={{ width: `${remaining.percent}%` }}
                  />
                </div>

                <div className="saved-job-content">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="company-name">
                        <Building size={13} style={{ display: 'inline', marginRight: 4 }} />
                        {job.company}
                      </div>
                    </div>
                    <span className="site-badge">{job.site || 'web'}</span>
                  </div>

                  <div className="job-details">
                    <div className="detail-item">
                      <MapPin size={14} color="var(--accent-primary)" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="detail-item" style={{ color: '#34d399' }}>
                        {job.salary}
                      </div>
                    )}
                    {job.date_posted && (
                      <div className="detail-item">
                        <Calendar size={14} />
                        {job.date_posted}
                      </div>
                    )}
                  </div>

                  {job.description && (
                    <p className="job-snippet">{job.description}</p>
                  )}

                  <div className="saved-job-timer">
                    <Clock size={13} />
                    <span className={urgencyClass}>{remaining.text}</span>
                  </div>
                </div>

                <div className="job-card-footer">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Saved {new Date(job.savedAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 8px', color: '#fb7185' }}
                      onClick={() => handleUnsave(job._id)}
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      Apply <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

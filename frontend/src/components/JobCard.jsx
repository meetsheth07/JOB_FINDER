import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, MapPin, Building, Calendar, DollarSign, Trash2, Bookmark } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function JobCard({ job, onDelete }) {
  const { isAuthenticated, token } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const siteClass = (job.site || '').toLowerCase();

  // Check if job is saved when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && job._id) {
      checkIfSaved();
    }
  }, [isAuthenticated, token, job._id]);

  const checkIfSaved = async () => {
    try {
      const res = await fetch(`${API_BASE}/saved-jobs/check/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.isSaved);
        if (data.savedJob) setSavedJobId(data.savedJob._id);
      }
    } catch (err) {
      // Silently fail — not critical
    }
  };

  const formatSalary = () => {
    if (job.min_amount || job.max_amount) {
      const cur = job.currency || '$';
      const min = job.min_amount ? `${cur}${job.min_amount.toLocaleString()}` : '';
      const max = job.max_amount ? `${cur}${job.max_amount.toLocaleString()}` : '';
      const interval = job.interval ? ` / ${job.interval}` : '';
      if (min && max) return `${min} - ${max}${interval}`;
      return `${min || max}${interval}`;
    }
    return null;
  };

  const salary = formatSalary();

  const handleToggleSave = async () => {
    if (!isAuthenticated || isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved && savedJobId) {
        // Unsave
        const res = await fetch(`${API_BASE}/saved-jobs/${savedJobId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setIsSaved(false);
          setSavedJobId(null);
        }
      } else {
        // Save
        const salaryStr = salary || '';
        const res = await fetch(`${API_BASE}/saved-jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            jobId: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            job_url: job.job_url,
            site: job.site,
            description: job.description,
            salary: salaryStr,
            date_posted: job.date_posted,
            is_remote: job.is_remote
          })
        });
        const data = await res.json();
        if (data.success) {
          setIsSaved(true);
          setSavedJobId(data.savedJob._id);
        }
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`glass-panel job-card ${siteClass}`}>
      <div>
        <div className="job-card-header">
          <div>
            <h3 className="job-title">{job.title}</h3>
            <div className="company-name">
              <Building size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {job.company}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isAuthenticated && (
              <button
                className={`bookmark-btn ${isSaved ? 'bookmarked' : ''}`}
                onClick={handleToggleSave}
                disabled={isSaving}
                title={isSaved ? 'Remove from saved' : 'Save this job'}
              >
                <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
            <span className="site-badge">{job.site || 'web'}</span>
          </div>
        </div>

        <div className="job-details">
          <div className="detail-item">
            <MapPin size={14} color="var(--accent-primary)" />
            {job.location}
          </div>

          {salary && (
            <div className="detail-item" style={{ color: '#34d399' }}>
              <DollarSign size={14} />
              {salary}
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
      </div>

      <div className="job-card-footer">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {new Date(job.scraped_at || job.createdAt).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            style={{ padding: '6px 8px', color: '#fb7185' }}
            onClick={() => onDelete(job._id)}
            title="Remove job"
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
}

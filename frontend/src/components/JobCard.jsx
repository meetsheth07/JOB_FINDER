import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config.js';
import {  ExternalLink, MapPin, Building2, Calendar, DollarSign,
  Trash2, Bookmark, Wifi, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

export default function JobCard({ job, onDelete }) {
  const { isAuthenticated, token } = useAuth();
  const [isSaved, setIsSaved]       = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const siteName  = (job.site || 'web').toLowerCase();

  useEffect(() => {
    if (isAuthenticated && token && job._id) checkIfSaved();
  }, [isAuthenticated, token, job._id]);

  const checkIfSaved = async () => {
    try {
      const res  = await fetch(`${API_BASE}/saved-jobs/check/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.isSaved);
        if (data.savedJob) setSavedJobId(data.savedJob._id);
      }
    } catch { /* non-critical */ }
  };

  const formatSalary = () => {
    if (!job.min_amount && !job.max_amount) return null;
    const cur = job.currency || '$';
    const min = job.min_amount ? `${cur}${Number(job.min_amount).toLocaleString()}` : '';
    const max = job.max_amount ? `${cur}${Number(job.max_amount).toLocaleString()}` : '';
    const interval = job.interval ? ` / ${job.interval}` : '';
    if (min && max) return `${min} – ${max}${interval}`;
    return `${min || max}${interval}`;
  };

  const salary = formatSalary();

  const handleToggleSave = async () => {
    if (!isAuthenticated || isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved && savedJobId) {
        const res  = await fetch(`${API_BASE}/saved-jobs/${savedJobId}`, {
          method:  'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) { setIsSaved(false); setSavedJobId(null); }
      } else {
        const res  = await fetch(`${API_BASE}/saved-jobs`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            jobId: job._id, title: job.title, company: job.company,
            location: job.location, job_url: job.job_url, site: job.site,
            description: job.description, salary: salary || '',
            date_posted: job.date_posted, is_remote: job.is_remote
          })
        });
        const data = await res.json();
        if (data.success) { setIsSaved(true); setSavedJobId(data.savedJob._id); }
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const postedDate = job.date_posted
    ? new Date(job.date_posted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const scrapedDate = job.scraped_at || job.createdAt
    ? new Date(job.scraped_at || job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="job-card">
      {/* Accent top bar */}
      <div className="job-card-bar" />

      {/* Site badge top-right */}
      <div
        className="job-site-badge"
        style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
      >
        {siteName}
      </div>

      {/* Card body */}
      <div className="job-card-body">
        {/* Title + company */}
        <div className="job-card-title-row">
          <div className="job-card-text">
            <h3 className="job-title">{job.title}</h3>
            <div className="company-name">
              <Building2 size={11} />
              {job.company}
            </div>
          </div>

          {isAuthenticated && (
            <button
              className={`bookmark-btn ${isSaved ? 'bookmarked' : ''}`}
              onClick={handleToggleSave}
              disabled={isSaving}
              title={isSaved ? 'Remove from saved' : 'Save this job'}
            >
              <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Meta pills */}
        <div className="job-meta-row">
          {job.location && (
            <span className="job-meta-pill">
              <MapPin size={10} /> {job.location}
            </span>
          )}
          {job.is_remote && (
            <span className="job-meta-pill remote-pill">
              <Wifi size={10} /> REMOTE
            </span>
          )}
          {job.job_type && (
            <span className="job-meta-pill">
              {job.job_type}
            </span>
          )}
        </div>

        {/* Salary */}
        {salary && (
          <div className="job-salary">
            <DollarSign size={12} />
            {salary}
          </div>
        )}

        {/* Description snippet */}
        {job.description && (
          <div className="job-desc-wrapper">
            <p className={`job-snippet ${expanded ? 'expanded' : ''}`}>
              {job.description}
            </p>
            {job.description.length > 180 && (
              <button
                className="expand-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <><ChevronUp size={11} /> LESS</> : <><ChevronDown size={11} /> MORE</>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="job-card-footer">
        <div className="job-card-dates">
          {postedDate && (
            <span className="job-date-tag">
              <Calendar size={10} /> POSTED {postedDate}
            </span>
          )}
          {scrapedDate && (
            <span className="job-date-tag muted">
              <Clock size={10} /> SCRAPED {scrapedDate}
            </span>
          )}
        </div>

        <div className="job-card-actions">
          <button
            className="icon-btn danger-btn"
            onClick={() => onDelete(job._id)}
            title="Remove job"
          >
            <Trash2 size={12} />
          </button>

          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary apply-btn"
          >
            APPLY <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

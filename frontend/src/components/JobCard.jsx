import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ExternalLink, MapPin, Building2, Calendar, DollarSign,
  Trash2, Bookmark, Wifi, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const SITE_COLORS = {
  linkedin:      { bg: 'rgba(10,102,194,0.15)',  border: 'rgba(10,102,194,0.4)',  bar: '#0a66c2' },
  indeed:        { bg: 'rgba(37,87,167,0.15)',   border: 'rgba(37,87,167,0.4)',   bar: '#2557a7' },
  google:        { bg: 'rgba(234,67,53,0.12)',   border: 'rgba(234,67,53,0.3)',   bar: '#ea4335' },
  glassdoor:     { bg: 'rgba(0,162,100,0.12)',   border: 'rgba(0,162,100,0.3)',   bar: '#00a264' },
  zip_recruiter: { bg: 'rgba(232,67,10,0.12)',   border: 'rgba(232,67,10,0.3)',   bar: '#e8430a' },
  naukri:        { bg: 'rgba(243,145,30,0.12)',  border: 'rgba(243,145,30,0.3)',  bar: '#f3911e' },
  bayt:          { bg: 'rgba(192,57,43,0.12)',   border: 'rgba(192,57,43,0.3)',   bar: '#c0392b' },
  bdjobs:        { bg: 'rgba(22,160,133,0.12)',  border: 'rgba(22,160,133,0.3)',  bar: '#16a085' },
};

function getSiteStyle(site) {
  return SITE_COLORS[(site || '').toLowerCase()] || SITE_COLORS['indeed'];
}

export default function JobCard({ job, onDelete }) {
  const { isAuthenticated, token } = useAuth();
  const [isSaved, setIsSaved]       = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const siteStyle = getSiteStyle(job.site);
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
    <div
      className="job-card glass-panel"
      style={{ '--site-bar': siteStyle.bar }}
    >
      {/* Brand colour top bar */}
      <div className="job-card-bar" />

      {/* Site badge top-right */}
      <div
        className="job-site-badge"
        style={{ background: siteStyle.bg, border: `1px solid ${siteStyle.border}`, color: siteStyle.bar }}
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
              <Building2 size={12} />
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
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Meta pills */}
        <div className="job-meta-row">
          {job.location && (
            <span className="job-meta-pill">
              <MapPin size={11} /> {job.location}
            </span>
          )}
          {job.is_remote && (
            <span className="job-meta-pill remote-pill">
              <Wifi size={11} /> Remote
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
            <DollarSign size={13} />
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
                {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> More</>}
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
              <Calendar size={11} /> Posted {postedDate}
            </span>
          )}
          {scrapedDate && (
            <span className="job-date-tag muted">
              <Clock size={11} /> Scraped {scrapedDate}
            </span>
          )}
        </div>

        <div className="job-card-actions">
          <button
            className="icon-btn danger-btn"
            onClick={() => onDelete(job._id)}
            title="Remove job"
          >
            <Trash2 size={13} />
          </button>

          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary apply-btn"
          >
            Apply <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

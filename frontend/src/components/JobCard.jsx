import React from 'react';
import { ExternalLink, MapPin, Building, Calendar, DollarSign, Trash2, ShieldCheck } from 'lucide-react';

export default function JobCard({ job, onDelete }) {
  const siteClass = (job.site || '').toLowerCase();

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
          <span className="site-badge">{job.site || 'web'}</span>
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

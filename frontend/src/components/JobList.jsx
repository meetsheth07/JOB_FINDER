import React from 'react';
import JobCard from './JobCard';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

export default function JobList({ jobs, onDeleteJob, pagination, onPageChange, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 14px', width: '28px', height: '28px' }} />
        <p className="mono-sm" style={{ color: 'var(--ink-muted)' }}>LOADING JOBS FROM DATABASE...</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'var(--panel)',
        border: '1px solid var(--hairline)',
        borderRadius: '12px'
      }}>
        <Inbox size={44} color="var(--ink-muted)" style={{ marginBottom: '12px' }} />
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 700,
          letterSpacing: '-.02em',
          color: 'var(--ink)',
          marginBottom: '6px'
        }}>No Jobs Found</h3>
        <p className="mono-sm" style={{ color: 'var(--ink-muted)' }}>
          USE THE SEARCH PANEL ABOVE TO SCRAPE LIVE JOBS FROM INDEED, LINKEDIN, OR GOOGLE.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="job-grid">
        {jobs.map((job) => (
          <JobCard key={job._id || job.job_url} job={job} onDelete={onDeleteJob} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '28px' }}>
          <button
            className="btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={14} /> PREV
          </button>

          <span className="mono-sm" style={{ color: 'var(--ink-muted)', fontSize: '10px' }}>
            PAGE <strong style={{ color: 'var(--ink)' }}>{pagination.page}</strong> OF {pagination.pages} ({pagination.total} TOTAL)
          </span>

          <button
            className="btn-secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            NEXT <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

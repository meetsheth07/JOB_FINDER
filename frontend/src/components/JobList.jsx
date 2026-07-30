import React from 'react';
import JobCard from './JobCard';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

export default function JobList({ jobs, onDeleteJob, pagination, onPageChange, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }}></div>
        <p>Loading jobs from MongoDB...</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <Inbox size={48} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>No Jobs Found</h3>
        <p style={{ fontSize: '0.88rem' }}>Use the search control panel above to scrape live jobs from Indeed, LinkedIn, or Google.</p>
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
          <button
            className="btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Page <strong style={{ color: 'var(--text-main)' }}>{pagination.page}</strong> of {pagination.pages} ({pagination.total} total)
          </span>

          <button
            className="btn-secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

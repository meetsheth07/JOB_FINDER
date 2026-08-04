import React from 'react';
import { Search, Filter, Trash2, ArrowUpDown } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedSite,
  onSiteChange,
  sortBy,
  onSortChange,
  onClearAll,
  totalJobs
}) {
  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            className="custom-input"
            style={{ paddingLeft: '34px' }}
            placeholder="Filter saved jobs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} color="var(--ink-muted)" />
          <select
            className="custom-select"
            style={{ width: '130px' }}
            value={selectedSite}
            onChange={(e) => onSiteChange(e.target.value)}
          >
            <option value="all">All Sites</option>
            <option value="indeed">Indeed</option>
            <option value="linkedin">LinkedIn</option>
            <option value="google">Google</option>
            <option value="zip_recruiter">ZipRecruiter</option>
            <option value="glassdoor">Glassdoor</option>
            <option value="naukri">Naukri</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={13} color="var(--ink-muted)" />
          <select
            className="custom-select"
            style={{ width: '130px' }}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="scraped_at">Latest Scraped</option>
            <option value="title">Job Title</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      {totalJobs > 0 && (
        <button
          className="btn-secondary btn-danger"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete all jobs from the database?')) {
              onClearAll();
            }
          }}
        >
          <Trash2 size={13} /> CLEAR DB
        </button>
      )}
    </div>
  );
}

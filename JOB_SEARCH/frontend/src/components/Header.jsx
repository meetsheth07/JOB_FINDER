import React from 'react';
import { Briefcase, Database, RefreshCw } from 'lucide-react';

export default function Header({ isMongoConnected, onRefresh, totalCount }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="logo-icon">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="brand-title">JOB_SEARCH</h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Full-Stack Scraper & Management Suite
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="badge-status">
          <span className="pulse-dot"></span>
          <Database size={14} />
          {isMongoConnected ? 'MongoDB Connected' : 'DB Offline'}
        </div>

        <button className="btn-secondary" onClick={onRefresh} title="Refresh jobs">
          <RefreshCw size={14} />
          Sync ({totalCount})
        </button>
      </div>
    </header>
  );
}

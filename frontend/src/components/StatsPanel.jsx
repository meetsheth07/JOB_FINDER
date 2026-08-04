import React from 'react';
import { Briefcase, Clock, Building2, Layers } from 'lucide-react';

export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <Briefcase size={20} />
        </div>
        <div>
          <div className="stat-value">{stats.totalJobs || 0}</div>
          <div className="stat-label">TOTAL JOBS IN DB</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--status-green-dim)', color: 'var(--status-green)' }}>
          <Clock size={20} />
        </div>
        <div>
          <div className="stat-value">{stats.recent24h || 0}</div>
          <div className="stat-label">SCRAPED IN 24H</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <Layers size={20} />
        </div>
        <div>
          <div className="stat-value">{stats.siteStats ? stats.siteStats.length : 0}</div>
          <div className="stat-label">ACTIVE SOURCES</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <Building2 size={20} />
        </div>
        <div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>
            {stats.topCompanies && stats.topCompanies[0] ? stats.topCompanies[0]._id : 'N/A'}
          </div>
          <div className="stat-label">TOP HIRING COMPANY</div>
        </div>
      </div>
    </div>
  );
}

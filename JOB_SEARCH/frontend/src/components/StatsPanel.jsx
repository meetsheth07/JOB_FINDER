import React from 'react';
import { Briefcase, Clock, Building2, Layers } from 'lucide-react';

export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          <Briefcase size={22} />
        </div>
        <div>
          <div className="stat-value">{stats.totalJobs || 0}</div>
          <div className="stat-label">Total Jobs in DB</div>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          <Clock size={22} />
        </div>
        <div>
          <div className="stat-value">{stats.recent24h || 0}</div>
          <div className="stat-label">Scraped in 24h</div>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
          <Layers size={22} />
        </div>
        <div>
          <div className="stat-value">{stats.siteStats ? stats.siteStats.length : 0}</div>
          <div className="stat-label">Active Sources</div>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
          <Building2 size={22} />
        </div>
        <div>
          <div className="stat-value">
            {stats.topCompanies && stats.topCompanies[0] ? stats.topCompanies[0]._id : 'N/A'}
          </div>
          <div className="stat-label">Top Hiring Company</div>
        </div>
      </div>
    </div>
  );
}

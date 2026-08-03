import React, { useState } from 'react';
import { Search, MapPin, Globe, Filter, Sparkles, Sliders, CheckSquare, Square } from 'lucide-react';

const AVAILABLE_SITES = [
  { id: 'indeed', label: 'Indeed' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'google', label: 'Google Jobs' },
  { id: 'zip_recruiter', label: 'ZipRecruiter' },
  { id: 'glassdoor', label: 'Glassdoor' },
  { id: 'naukri', label: 'Naukri' },
  { id: 'bayt', label: 'Bayt' },
  { id: 'bdjobs', label: 'BDJobs' },
];

const COUNTRIES = ['USA', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'Singapore', 'UAE', 'Saudi Arabia'];

export default function SearchForm({ onScrape, isScraping, scrapeStatus }) {
  const [formData, setFormData] = useState({
    search_term: 'software engineer',
    location: 'San Francisco, CA',
    country: 'USA',
    google_query: '',
    results_wanted: 20,
    hours_old: 72,
    sites: ['indeed', 'linkedin'],
    only_no_experience: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleSite = (siteId) => {
    setFormData((prev) => {
      const exists = prev.sites.includes(siteId);
      const updated = exists
        ? prev.sites.filter((s) => s !== siteId)
        : [...prev.sites, siteId];
      return { ...prev, sites: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.sites.length === 0) {
      alert('Please select at least one job source.');
      return;
    }
    onScrape(formData);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#3b82f6" size={20} />
            Job Search & Scraper Control
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fetch live jobs from Indeed, LinkedIn, Google & more
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Sliders size={14} />
          {showAdvanced ? 'Simple View' : 'Advanced Options'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label className="input-label">
              <Search size={14} /> Search Title / Role
            </label>
            <input
              type="text"
              className="custom-input"
              value={formData.search_term}
              onChange={(e) => setFormData({ ...formData, search_term: e.target.value })}
              placeholder="e.g. Full Stack Developer, Data Analyst"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <MapPin size={14} /> Location
            </label>
            <input
              type="text"
              className="custom-input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. New York, London, Remote"
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Globe size={14} /> Country
            </label>
            <select
              className="custom-select"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Results Wanted ({formData.results_wanted})</label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={formData.results_wanted}
              onChange={(e) => setFormData({ ...formData, results_wanted: parseInt(e.target.value) })}
              style={{ accentColor: 'var(--accent-primary)', marginTop: '8px' }}
            />
          </div>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Hours Old</label>
                <select
                  className="custom-select"
                  value={formData.hours_old}
                  onChange={(e) => setFormData({ ...formData, hours_old: parseInt(e.target.value) })}
                >
                  <option value={24}>Past 24 Hours</option>
                  <option value={48}>Past 48 Hours</option>
                  <option value={72}>Past 72 Hours (Default)</option>
                  <option value={168}>Past 7 Days</option>
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Custom Google Query (Optional)</label>
                <input
                  type="text"
                  className="custom-input"
                  value={formData.google_query}
                  onChange={(e) => setFormData({ ...formData, google_query: e.target.value })}
                  placeholder="e.g. React Developer jobs near New York since yesterday"
                />
              </div>
            </div>
          </div>
        )}

        {/* Site Selection */}
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">Target Job Platforms</label>
          <div className="sites-checkbox-grid">
            {AVAILABLE_SITES.map((site) => {
              const active = formData.sites.includes(site.id);
              return (
                <div
                  key={site.id}
                  className={`checkbox-pill ${active ? 'active' : ''}`}
                  onClick={() => toggleSite(site.id)}
                >
                  {active ? <CheckSquare size={16} color="#60a5fa" /> : <Square size={16} color="#6b7280" />}
                  {site.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Toggle & Submit */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={formData.only_no_experience}
              onChange={(e) => setFormData({ ...formData, only_no_experience: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
            />
            Only show entry-level / no prior experience required
          </label>

          <button type="submit" className="btn-primary" disabled={isScraping}>
            {isScraping ? (
              <>
                <div className="spinner"></div>
                Searching Job Boards...
              </>
            ) : (
              <>
                <Search size={18} />
                Find & Save Jobs
              </>
            )}
          </button>
        </div>

        {scrapeStatus && (
          <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: scrapeStatus.error ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: scrapeStatus.error ? '#fb7185' : '#34d399', fontSize: '0.88rem' }}>
            {scrapeStatus.message}
          </div>
        )}
      </form>
    </div>
  );
}

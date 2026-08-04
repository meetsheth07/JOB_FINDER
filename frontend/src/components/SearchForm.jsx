import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Sliders, CheckSquare, Square, Clock, Zap } from 'lucide-react';

const AVAILABLE_SITES = [
  { id: 'indeed',        label: 'Indeed',       color: '#F0A422' },
  { id: 'linkedin',      label: 'LinkedIn',     color: '#F0A422' },
  { id: 'google',        label: 'Google Jobs',  color: '#F0A422' },
  { id: 'zip_recruiter', label: 'ZipRecruiter', color: '#F0A422' },
  { id: 'glassdoor',     label: 'Glassdoor',    color: '#F0A422' },
  { id: 'naukri',        label: 'Naukri',       color: '#F0A422' },
  { id: 'bayt',          label: 'Bayt',         color: '#F0A422' },
  { id: 'bdjobs',        label: 'BDJobs',       color: '#F0A422' },
];

const COUNTRIES = ['USA', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'Singapore', 'UAE', 'Saudi Arabia'];

const HOURS_OPTIONS = [
  { value: 24,  label: 'Past 24 Hours' },
  { value: 48,  label: 'Past 48 Hours' },
  { value: 72,  label: 'Past 72 Hours' },
  { value: 168, label: 'Past 7 Days' },
];

export default function SearchForm({ onScrape, isScraping, scrapeStatus }) {
  const [formData, setFormData] = useState({
    search_term: '',
    location: '',
    country: 'USA',
    google_query: '',
    results_wanted: 20,
    hours_old: 72,
    sites: ['indeed', 'linkedin'],
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
    if (!formData.search_term.trim()) {
      alert('Please enter a job title or search term.');
      return;
    }
    onScrape(formData);
  };

  return (
    <div className="search-panel">
      {/* Header */}
      <div className="search-panel-header">
        <div className="search-panel-title-group">
          <div className="search-panel-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="search-panel-title">Find Your Next Role</h2>
            <p className="search-panel-sub">SEARCH ACROSS INDEED, LINKEDIN, GOOGLE JOBS &amp; MORE</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Sliders size={13} />
          {showAdvanced ? 'SIMPLE' : 'ADVANCED'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Main search row */}
        <div className="search-main-row">
          <div className="search-field-primary">
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon-left" />
              <input
                type="text"
                className="search-big-input"
                value={formData.search_term}
                onChange={(e) => setFormData({ ...formData, search_term: e.target.value })}
                placeholder="Job title, role, or keyword..."
                required
              />
            </div>
          </div>

          <div className="search-field-secondary">
            <div className="search-input-wrapper">
              <MapPin size={13} className="search-icon-left" />
              <input
                type="text"
                className="search-big-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Location (city, remote...)"
              />
            </div>
          </div>

          <div className="search-field-country">
            <select
              className="search-select"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results slider */}
        <div className="results-slider-row">
          <span className="results-slider-label">
            <Zap size={12} />
            FETCH UP TO <strong>{formData.results_wanted}</strong> RESULTS
          </span>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={formData.results_wanted}
            onChange={(e) => setFormData({ ...formData, results_wanted: parseInt(e.target.value) })}
            className="results-range"
          />
        </div>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="advanced-section">
            <div className="advanced-grid">
              <div className="input-group">
                <label className="input-label">
                  <Clock size={12} /> TIME WINDOW
                </label>
                <select
                  className="custom-select"
                  value={formData.hours_old}
                  onChange={(e) => setFormData({ ...formData, hours_old: parseInt(e.target.value) })}
                >
                  {HOURS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">
                  <Search size={12} /> CUSTOM GOOGLE QUERY
                </label>
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
        <div className="sites-section">
          <label className="input-label" style={{ marginBottom: '10px', display: 'flex' }}>
            TARGET PLATFORMS
          </label>
          <div className="sites-pills">
            {AVAILABLE_SITES.map((site) => {
              const active = formData.sites.includes(site.id);
              return (
                <button
                  key={site.id}
                  type="button"
                  className={`site-pill ${active ? 'active' : ''}`}
                  onClick={() => toggleSite(site.id)}
                >
                  {active ? <CheckSquare size={12} /> : <Square size={12} />}
                  {site.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit row */}
        <div className="submit-row">
          {scrapeStatus && (
            <div className={`scrape-status ${scrapeStatus.error ? 'error' : 'success'}`}>
              <span className="scrape-status-dot" />
              {scrapeStatus.message}
            </div>
          )}
          <button type="submit" className="btn-primary search-submit" disabled={isScraping}>
            {isScraping ? (
              <>
                <div className="spinner" />
                SEARCHING...
              </>
            ) : (
              <>
                <Search size={14} />
                FIND &amp; SAVE JOBS
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

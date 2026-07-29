# 🌐 JOB_SEARCH — Frontend Web App

This directory contains the React + Vite frontend application for **JOB_SEARCH**, built with custom CSS glassmorphism, responsive grid layouts, and Lucide React icons.

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The app will be accessible at `http://localhost:5173`.

## 🎨 UI Component Overview

- `App.jsx`: Global state, REST API calls, notification toasts.
- `components/Header.jsx`: App navbar with live MongoDB connection status badge.
- `components/SearchForm.jsx`: Hero form controlling job title, location, country, result limits, and source platforms.
- `components/StatsPanel.jsx`: Metric cards showing DB counts and platform distribution.
- `components/FilterBar.jsx`: Real-time text search filter, site filter, and database reset controls.
- `components/JobCard.jsx`: Glassmorphic job card displaying salary details, location, company, and quick apply link.
- `components/JobList.jsx`: Responsive grid displaying jobs with full pagination controls.

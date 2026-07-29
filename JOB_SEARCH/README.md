# 📦 JOB_SEARCH Application Suite

This folder contains the complete full-stack web application for **JOB_SEARCH**.

## 📂 Subdirectories

- **`backend/`**: Express.js server, Mongoose models, REST API routes, and headless Python scraper bridge script (`scraper.py`).
- **`frontend/`**: React + Vite user interface with glassmorphic dark theme and interactive control panels.

## 🚀 Running the App

1. Ensure MongoDB service is running locally on `mongodb://localhost:27017/JOB_SCRAPPER`.
2. Start backend server:
   ```bash
   cd backend
   npm start
   ```
3. Start frontend app:
   ```bash
   cd frontend
   npm run dev
   ```

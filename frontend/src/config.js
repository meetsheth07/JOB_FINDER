// Central API base URL.
// In development: Vite proxies /api → http://localhost:5000 (see vite.config.js).
// In production: set VITE_API_URL in your Vercel environment variables
//   e.g.  VITE_API_URL = https://your-backend.railway.app/api
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default API_BASE;

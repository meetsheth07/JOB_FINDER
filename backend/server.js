const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jobsRouter = require('./routes/jobs');
const authRouter = require('./routes/auth');
const savedJobsRouter = require('./routes/savedJobs');

const app = express();
const PORT = process.env.PORT || 5000;
// Use 127.0.0.1 instead of localhost to avoid IPv6 (::1) resolution issues
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/JOB_SCRAPPER';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/saved-jobs', savedJobsRouter);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'JOB_SEARCH Backend API',
    mongoState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Graceful server start with EADDRINUSE handling
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

// Connect to MongoDB & Start Server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    startServer(PORT);
  })
  .catch((err) => {
    console.error(`MongoDB connection error: ${err.message}`);
    console.log('Starting server in fallback mode without MongoDB connection...');
    startServer(PORT);
  });

const mongoose = require('mongoose');

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 259200000 ms

const SavedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  // Snapshot fields — persisted even if original Job document is deleted
  title: { type: String, default: 'Untitled Job' },
  company: { type: String, default: 'Unknown Company' },
  location: { type: String, default: 'Not specified' },
  job_url: { type: String, required: true },
  site: { type: String, default: 'web' },
  description: { type: String, default: '' },
  salary: { type: String, default: '' },
  date_posted: { type: String, default: '' },
  is_remote: { type: Boolean, default: false },

  savedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + THREE_DAYS_MS),
    index: { expires: 0 } // TTL index — MongoDB auto-deletes when expiresAt is reached
  }
});

// Prevent duplicate saves: one user can save a job only once
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);

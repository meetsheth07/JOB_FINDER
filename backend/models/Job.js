const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, default: 'Unknown Company', trim: true },
  location: { type: String, default: 'Not specified', trim: true },
  job_url: { type: String, required: true, unique: true, trim: true },
  site: { type: String, default: 'unknown', trim: true },
  description: { type: String, default: '' },
  job_type: { type: String, default: '' },
  date_posted: { type: String, default: '' },
  min_amount: { type: Number, default: null },
  max_amount: { type: Number, default: null },
  currency: { type: String, default: '' },
  interval: { type: String, default: '' },
  is_remote: { type: Boolean, default: false },
  search_term: { type: String, default: '' },
  country: { type: String, default: '' },
  scraped_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);

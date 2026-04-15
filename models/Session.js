const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  browser: String,
  os: String,
  device: String,
  loginAt: {
    type: Date,
    default: Date.now
  },
  logoutAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    city: String,
    country: String
  }
}, {
  timestamps: true
});

sessionLogSchema.index({ user: 1, isActive: 1 });
sessionLogSchema.index({ loginAt: -1 });

const SessionLog = mongoose.model('SessionLog', sessionLogSchema);

module.exports = SessionLog;

const mongoose = require('mongoose');

const pointEntrySchema = new mongoose.Schema({
  // Reference to the user who earned the points
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Point details
  points: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  
  // Admin who added the points
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
pointEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
pointEntrySchema.index({ userId: 1 });
pointEntrySchema.index({ createdAt: -1 });
pointEntrySchema.index({ userId: 1, createdAt: -1 });

const PointEntry = mongoose.model('PointEntry', pointEntrySchema);

module.exports = PointEntry; 
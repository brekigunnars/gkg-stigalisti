const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // User account fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  },
  
  // Player profile fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  pointsLastUpdated: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ gender: 1 });
userSchema.index({ points: -1 }); // For sorting leaderboards

const User = mongoose.model('User', userSchema);

module.exports = User; 
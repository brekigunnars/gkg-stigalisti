const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
    unique: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
leaderboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
leaderboardSchema.index({ gender: 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Create default leaderboards if they don't exist
const initializeLeaderboards = async () => {
  try {
    const maleLeaderboard = await Leaderboard.findOne({ gender: 'male' });
    if (!maleLeaderboard) {
      await Leaderboard.create({ gender: 'male', players: [] });
    }

    const femaleLeaderboard = await Leaderboard.findOne({ gender: 'female' });
    if (!femaleLeaderboard) {
      await Leaderboard.create({ gender: 'female', players: [] });
    }
  } catch (error) {
    console.error('Error initializing leaderboards:', error);
  }
};

// Initialize leaderboards when the model is loaded
initializeLeaderboards();

module.exports = Leaderboard; 
const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  handicap: {
    type: Number,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  pointsHistory: [
    {
      points: {
        type: Number,
        required: true
      },
      reason: {
        type: String,
        required: false
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Player = mongoose.model('Player', PlayerSchema);

module.exports = Player; 
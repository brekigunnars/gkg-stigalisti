const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// Welcome Page - Public leaderboard
router.get('/', async (req, res) => {
  try {
    // Get men and women players separately, sorted by points
    const menPlayers = await User.find({ gender: 'male', role: 'player' }).sort({ points: -1 });
    const womenPlayers = await User.find({ gender: 'female', role: 'player' }).sort({ points: -1 });
    
    res.render('welcome', {
      menPlayers,
      womenPlayers,
      title: 'Stigalisti GKG',
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Dashboard - For admins after login
router.get('/dashboard', ensureAdmin, async (req, res) => {
  try {
    // Get men and women players separately for the dashboard
    const menPlayers = await User.find({ gender: 'male', role: 'player' }).sort({ points: -1 });
    const womenPlayers = await User.find({ gender: 'female', role: 'player' }).sort({ points: -1 });
    
    res.render('dashboard', {
      name: req.user.name,
      menPlayers,
      womenPlayers,
      title: 'Stjórnborð'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin Add Points Page
router.get('/manage-points', ensureAdmin, async (req, res) => {
  try {
    // Get men and women players separately, sorted by name
    const menPlayers = await User.find({ gender: 'male', role: 'player' }).sort({ name: 1 });
    const womenPlayers = await User.find({ gender: 'female', role: 'player' }).sort({ name: 1 });
    
    res.render('manage-points', {
      menPlayers,
      womenPlayers,
      title: 'Stiga Stjórnun'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Stigareglur (Point Rules) page
router.get('/stigareglur', (req, res) => {
  res.render('stigareglur', { 
    title: 'Stigareglur',
    user: req.user || null
  });
});

// Debug route - only in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug-users', async (req, res) => {
    try {
      const users = await User.find().select('_id email name role gender points pointsLastUpdated');
      res.json({ 
        message: 'User database debug information', 
        count: users.length,
        users 
      });
    } catch (err) {
      console.error('Debug route error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Add debug route for players
  router.get('/debug-players', async (req, res) => {
    try {
      const players = await User.find().select('name gender points -_id');
      res.json({ 
        message: 'Player database debug information', 
        count: players.length,
        players,
        connection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      });
    } catch (err) {
      console.error('Debug route error:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = router; 
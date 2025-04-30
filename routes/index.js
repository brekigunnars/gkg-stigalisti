const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const Player = require('../models/Player');

// Welcome Page - Public leaderboard
router.get('/', async (req, res) => {
  try {
    const players = await Player.find().sort({ points: -1 }); // Sort by points in descending order
    res.render('welcome', {
      players,
      title: 'Stigalisti GKG'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Dashboard - For admins after login
router.get('/dashboard', ensureAdmin, async (req, res) => {
  try {
    const players = await Player.find().sort({ points: -1 });
    res.render('dashboard', {
      name: req.user.name,
      players,
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
    const players = await Player.find().sort({ name: 1 });
    res.render('manage-points', {
      players,
      title: 'Stiga Stjórnun'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 
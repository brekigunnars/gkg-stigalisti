const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

// Middleware to check if user is a player
const isPlayer = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === 'player') {
    return next();
  }
  req.flash('error_msg', 'Þú hefur ekki aðgang að þessari síðu');
  res.redirect('/');
};

// Show player dashboard
router.get('/dashboard', ensureAuthenticated, isPlayer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('player-account/dashboard', {
      user,
      title: 'Mín síða'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update Points Handle (for players to update their own points)
router.post('/update-points', ensureAuthenticated, isPlayer, async (req, res) => {
  try {
    const { points, notes } = req.body;
    const pointsDelta = parseInt(points);

    if (isNaN(pointsDelta)) {
      req.flash('error', 'Stig verða að vera tala');
      return res.redirect('/player-account/dashboard');
    }

    // Fetch user and update points
    const user = await User.findById(req.user._id);
    user.points += pointsDelta;
    user.pointsLastUpdated = Date.now();
    await user.save();

    const message = pointsDelta > 0 
      ? `Bætti við ${pointsDelta} stigum` 
      : `Dró frá ${Math.abs(pointsDelta)} stig`;
    
    if (notes) {
      req.flash('success', `${message} - ${notes}`);
    } else {
      req.flash('success', message);
    }
    
    res.redirect('/player-account/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Villa kom upp við að uppfæra stig');
    res.redirect('/player-account/dashboard');
  }
});

module.exports = router; 
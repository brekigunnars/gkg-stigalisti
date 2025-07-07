const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const PointEntry = require('../models/PointEntry');
const bcrypt = require('bcryptjs');

// Get all players (admin only)
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const players = await User.find({ role: 'player' }).sort({ name: 1 });
    res.render('players/index', {
      players,
      title: 'Allir kylfingar'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get men's leaderboard
router.get('/leaderboard/men', ensureAuthenticated, async (req, res) => {
  try {
    const players = await User.find({ gender: 'male', role: 'player' })
      .sort({ points: -1 })
      .limit(10);
    res.render('players/leaderboard', {
      players,
      title: 'Men\'s Leaderboard'
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving men\'s leaderboard');
    res.redirect('/dashboard');
  }
});

// Get women's leaderboard
router.get('/leaderboard/women', ensureAuthenticated, async (req, res) => {
  try {
    const players = await User.find({ gender: 'female', role: 'player' })
      .sort({ points: -1 })
      .limit(10);
    res.render('players/leaderboard', {
      players,
      title: 'Women\'s Leaderboard'
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving women\'s leaderboard');
    res.redirect('/dashboard');
  }
});

// Add player form
router.get('/add', ensureAdmin, (req, res) => {
  res.render('players/add', {
    title: 'Add New Player'
  });
});

// Add new player (admin only)
router.post('/', ensureAdmin, async (req, res) => {
  try {
    const { name, gender, email, points } = req.body;
    
    const userData = {
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@gkg.is`, // Generate email if not provided
      password: await bcrypt.hash('changeme123', 10), // Default password
      role: 'player',
      gender,
      points: parseInt(points) || 0,
      isActive: true
    };

    // Set pointsLastUpdated if initial points are provided
    if (userData.points > 0) {
      userData.pointsLastUpdated = Date.now();
    }

    // Create new user with player role
    const user = await User.create(userData);

    req.flash('success', 'Kylfingur bætt við');
    res.redirect('/players');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Villa kom upp við að bæta við kylfingi');
    res.redirect('/players');
  }
});

// Edit player form
router.get('/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const player = await User.findById(req.params.id);
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/players');
    }
    
    res.render('players/edit', {
      player,
      title: `Edit ${player.name}`
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving player');
    res.redirect('/players');
  }
});

// Update player (admin only)
router.put('/:id', ensureAdmin, async (req, res) => {
  try {
    const { name, gender, email, points, isActive } = req.body;
    
    const updateData = {
      name,
      gender,
      email,
      points: parseInt(points) || 0,
      isActive: isActive === 'on'
    };
    
    await User.findByIdAndUpdate(req.params.id, updateData);

    req.flash('success', 'Kylfingur uppfærður');
    res.redirect('/players');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Villa kom upp við að uppfæra kylfing');
    res.redirect('/players');
  }
});

// Delete player (admin only)
router.delete('/:id', ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'Kylfingur eytt');
    res.redirect('/players');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Villa kom upp við að eyða kylfingi');
    res.redirect('/players');
  }
});

// Admin update points route
router.post('/:id/update-points', ensureAdmin, async (req, res) => {
  try {
    const { points, notes } = req.body;
    const pointsDelta = parseInt(points);

    if (isNaN(pointsDelta)) {
      req.flash('error', 'Stig verða að vera tala');
      return res.redirect('/manage-points');
    }

    if (!notes || notes.trim() === '') {
      req.flash('error', 'Athugasemd er nauðsynleg');
      return res.redirect('/manage-points');
    }

    // Fetch user and update points
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'Kylfingur fannst ekki');
      return res.redirect('/manage-points');
    }

    // Create point entry record
    await PointEntry.create({
      userId: user._id,
      points: pointsDelta,
      comment: notes.trim(),
      addedBy: req.user._id
    });

    // Update user's total points
    user.points += pointsDelta;
    user.pointsLastUpdated = Date.now();
    await user.save();

    const message = pointsDelta > 0 
      ? `Bætti við ${pointsDelta} stigum hjá ${user.name}` 
      : `Dró frá ${Math.abs(pointsDelta)} stig hjá ${user.name}`;
    
    req.flash('success', `${message} - ${notes}`);
    res.redirect('/manage-points');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Villa kom upp við að uppfæra stig');
    res.redirect('/manage-points');
  }
});

module.exports = router; 
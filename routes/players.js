const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const Player = require('../models/Player');

// Get all players
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const players = await Player.find().sort({ name: 1 });
    res.render('players/index', {
      players,
      title: 'All Players'
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving players');
    res.redirect('/dashboard');
  }
});

// Add player form
router.get('/add', ensureAdmin, (req, res) => {
  res.render('players/add', {
    title: 'Add New Player'
  });
});

// Add player handle
router.post('/', ensureAdmin, async (req, res) => {
  try {
    const { name, email, phone, handicap, notes } = req.body;
    
    // Validation
    let errors = [];
    if (!name) {
      errors.push({ msg: 'Name is required' });
    }
    
    if (errors.length > 0) {
      return res.render('players/add', {
        errors,
        name,
        email,
        phone,
        handicap,
        notes,
        title: 'Add New Player'
      });
    }
    
    const newPlayer = new Player({
      name,
      email,
      phone,
      handicap,
      notes
    });
    
    await newPlayer.save();
    req.flash('success_msg', 'Player added successfully');
    res.redirect('/players');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding player');
    res.redirect('/players/add');
  }
});

// Edit player form
router.get('/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
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

// Update player
router.put('/:id', ensureAdmin, async (req, res) => {
  try {
    const { name, email, phone, handicap, notes } = req.body;
    
    await Player.findByIdAndUpdate(req.params.id, {
      name,
      email,
      phone,
      handicap,
      notes
    });
    
    req.flash('success_msg', 'Player updated successfully');
    res.redirect('/players');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating player');
    res.redirect(`/players/edit/${req.params.id}`);
  }
});

// Delete player
router.delete('/:id', ensureAdmin, async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Player deleted successfully');
    res.redirect('/players');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting player');
    res.redirect('/players');
  }
});

// Add points form
router.get('/:id/points', ensureAdmin, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/manage-points');
    }
    
    res.render('players/points', {
      player,
      title: `Add Points for ${player.name}`
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving player');
    res.redirect('/manage-points');
  }
});

// Add points handle
router.post('/:id/points', ensureAdmin, async (req, res) => {
  try {
    const { points, reason } = req.body;
    const pointsValue = parseInt(points);
    
    if (isNaN(pointsValue)) {
      req.flash('error_msg', 'Points must be a number');
      return res.redirect(`/players/${req.params.id}/points`);
    }
    
    const player = await Player.findById(req.params.id);
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/manage-points');
    }
    
    // Add to points history
    player.pointsHistory.push({
      points: pointsValue,
      reason: reason || `Points ${pointsValue > 0 ? 'added' : 'deducted'}`
    });
    
    // Update total points
    player.points += pointsValue;
    
    await player.save();
    
    req.flash('success_msg', `${Math.abs(pointsValue)} points ${pointsValue > 0 ? 'added to' : 'deducted from'} ${player.name}`);
    res.redirect('/manage-points');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating points');
    res.redirect(`/players/${req.params.id}/points`);
  }
});

// View player history
router.get('/:id/history', ensureAuthenticated, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/players');
    }
    
    res.render('players/history', {
      player,
      title: `${player.name}'s Points History`
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving player history');
    res.redirect('/players');
  }
});

module.exports = router; 
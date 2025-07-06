const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login', { title: 'Login' }));

// Register Page
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('users/register', { 
    title: 'Nýskráning kylfings',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// Register Handle
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, password2, gender } = req.body;

    // Validation
    if (!name || !email || !password || !password2 || !gender) {
      req.flash('error', 'Vinsamlegast fylltu út alla nauðsynlega reiti');
      return res.redirect('/users/register');
    }

    if (password !== password2) {
      req.flash('error', 'Lykilorðin passa ekki saman');
      return res.redirect('/users/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Lykilorð verður að vera að minnsta kosti 6 stafir');
      return res.redirect('/users/register');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Netfang er nú þegar í notkun');
      return res.redirect('/users/register');
    }

    // Create user with only essential fields
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'player',
      gender,
      points: 0,
      isActive: true
    });

    // Add user to appropriate leaderboard based on gender
    const leaderboard = await Leaderboard.findOne({ gender });
    if (leaderboard) {
      leaderboard.players.push(user._id);
      await leaderboard.save();
    }

    req.flash('success', 'Nýskráning tókst! Vinsamlegast skráðu þig inn.');
    res.redirect('/users/login');

  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Villa kom upp við nýskráningu. Vinsamlegast reyndu aftur.');
    res.redirect('/users/register');
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Rangt netfang eða lykilorð');
      return res.redirect('/users/login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // Redirect based on user role
      if (user.role === 'admin') {
        return res.redirect('/dashboard');
      } else {
        return res.redirect('/player-account/dashboard');
      }
    });
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router; 
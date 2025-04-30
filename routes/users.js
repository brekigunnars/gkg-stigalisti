const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login', { title: 'Login' }));

// Register Page - Redirect to login instead
router.get('/register', forwardAuthenticated, (req, res) => {
  req.flash('error_msg', 'Skráning nýrra notenda er ekki leyfð. Vinsamlegast hafðu samband við kerfisstjóra.');
  res.redirect('/users/login');
});

// Register Handle - Disabled
router.post('/register', (req, res) => {
  req.flash('error_msg', 'Skráning nýrra notenda er ekki leyfð. Vinsamlegast hafðu samband við kerfisstjóra.');
  res.redirect('/users/login');
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
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
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
  passport.authenticate('local', (err, user, info) => {
    if (err) { 
      console.error('Login error:', err);
      return next(err); 
    }
    
    if (!user) {
      req.flash('error_msg', info.message || 'Innskráning mistókst');
      return res.redirect('/users/login');
    }
    
    // Log user details for debugging
    console.log('Login successful for:', user.email);
    console.log('isAdmin status:', user.isAdmin);
    
    req.logIn(user, function(err) {
      if (err) { 
        console.error('Session error:', err);
        return next(err); 
      }
      return res.redirect('/dashboard');
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
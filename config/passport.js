const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Log authentication attempt
      console.log('Authenticating user:', email);
      
      // Match user
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            console.log('Email not found:', email);
            return done(null, false, { message: 'Netfang ekki skráð' });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.error('Password comparison error:', err);
              return done(err);
            }
            
            if (isMatch) {
              console.log('Password match for user:', email);
              return done(null, user);
            } else {
              console.log('Password incorrect for user:', email);
              return done(null, false, { message: 'Lykilorð rangt' });
            }
          });
        })
        .catch(err => {
          console.error('Database error during authentication:', err);
          return done(err);
        });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        console.error('Error deserializing user:', err);
        done(err, null);
      });
  });
}; 
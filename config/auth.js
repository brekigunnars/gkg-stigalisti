module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/users/login');
  },
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    req.flash('error_msg', 'You must be an admin to access this page');
    res.redirect('/');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
}; 
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Vinsamlegast skráðu þig inn til að fá aðgang að þessari síðu');
    res.redirect('/users/login');
  },
  ensureAdmin: function(req, res, next) {
    if (!req.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      req.flash('error_msg', 'Vinsamlegast skráðu þig inn');
      return res.redirect('/users/login');
    }
    
    if (!req.user) {
      console.log('User object missing after authentication');
      req.flash('error_msg', 'Villa kom upp, vinsamlegast skráðu þig inn aftur');
      return res.redirect('/users/login');
    }
    
    // Check for admin status or enable admin override in development
    if (req.user.isAdmin || (process.env.NODE_ENV !== 'production' && process.env.ADMIN_OVERRIDE === 'true')) {
      return next();
    }
    
    console.log('Admin access denied for user:', req.user.email);
    req.flash('error_msg', 'Þú þarft að vera stjórnandi til að fá aðgang að þessari síðu');
    res.redirect('/');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
}; 
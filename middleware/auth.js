// Authentication middleware
module.exports = {
  // Ensure user is authenticated
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Vinsamlegast skráðu þig inn til að fá aðgang');
    res.redirect('/users/login');
  },

  // Ensure user is admin
  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    req.flash('error', 'Þú hefur ekki aðgang að þessari síðu');
    res.redirect('/');
  }
}; 
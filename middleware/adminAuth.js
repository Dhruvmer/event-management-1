// Admin Authentication Middleware

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.isAdmin) {
    return next();
  }
  req.flash('error', 'Access denied. Admin privileges required.');
  return res.redirect('/admin/login');
};

const isAdminGuest = (req, res, next) => {
  if (req.session && req.session.user && req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  return next();
};

module.exports = { isAdmin, isAdminGuest };

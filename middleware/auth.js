// Authentication Middleware

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Please login to access this page');
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login');
};

// Check if user is NOT authenticated (for login/register pages)
const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/home');
  }
  return next();
};

// Check API token authentication
const isApiAuthenticated = (req, res, next) => {
  const token = req.headers['x-auth-token'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }
  
  // Verify token from session or database
  if (req.session && req.session.user && req.session.user.authToken === token) {
    req.user = req.session.user;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid or expired token.' 
  });
};

module.exports = {
  isAuthenticated,
  isGuest,
  isApiAuthenticated
};

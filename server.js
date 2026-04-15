/* ============================================
   EVENT MANAGEMENT SYSTEM - Main Server
   Professional Grade Node.js Application
   ============================================ */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const apiRoutes = require('./routes/apiRoutes');
const imageRoutes = require('./routes/imageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Import Middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import Database Config
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://checkout.razorpay.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(hpp());
app.use(cors({
  origin: process.env.BASE_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again after 15 minutes.'
});
app.use('/auth/login', authLimiter);
app.use('/admin/login', authLimiter);

// ============================================
// GENERAL MIDDLEWARE
// ============================================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(methodOverride('_method'));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static Files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : '0',
  etag: true
}));

// Image Handler Middleware for missing images
const handleMissingImages = require('./middleware/imageHandler');
app.use(handleMissingImages);

// ============================================
// VIEW ENGINE SETUP
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ============================================
// SESSION CONFIGURATION
// ============================================
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production-64chars-min-required-here',
  resave: false,
  saveUninitialized: false,
  // Temporarily disable MongoDB session store
  // store: MongoStore.create({
  //   mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventmanagement',
  //   collectionName: 'sessions',
  //   ttl: 24 * 60 * 60,
  //   autoRemove: 'native',
  //   touchAfter: 24 * 3600,
  //   crypto: {
  //     secret: process.env.TOKEN_SECRET || 'session-encryption-secret-key'
  //   }
  // }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  name: 'eventpro.sid'
};

// Fix rate limiter trust proxy issue
app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));
app.use(flash());

// ============================================
// GLOBAL VARIABLES MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.warning_msg = req.flash('warning');
  res.locals.info_msg = req.flash('info');
  res.locals.currentPath = req.path;
  res.locals.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  next();
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please login to access this page');
  res.redirect('/auth/login');
};

// ============================================
// ROUTES
// ============================================
app.use('/', authRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);
app.use('/api', apiRoutes);
app.use('/api', uploadRoutes);
app.use('/uploads/profiles', imageRoutes);
app.use('/uploads/events', imageRoutes);
app.use('/uploads/gallery', imageRoutes);

// Home Route
app.get('/', (req, res) => {
  res.render('user/landing', {
    title: 'EventPro - Professional Event Management',
    description: 'Create memorable events with our professional event management services',
    totalEvents: 15,
    completedBookings: 1250,
    featuredEvents: [],
    recentGallery: [],
    testimonials: []
  });
});

// Home Route (alias for root)
app.get('/home', (req, res) => {
  res.render('user/landing', {
    title: 'EventPro - Professional Event Management',
    description: 'Create memorable events with our professional event management services',
    totalEvents: 15,
    completedBookings: 1250,
    featuredEvents: [],
    recentGallery: [],
    testimonials: []
  });
});

// ============================================
// MISSING IMAGE HANDLER
// ============================================
app.use('/uploads/profiles/:filename', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads/profiles', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve default avatar
      const defaultPath = path.join(__dirname, 'public/images/default-avatar.png');
      return res.sendFile(defaultPath);
    }
    next();
  });
});

app.use('/uploads/events/:filename', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads/events', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const defaultPath = path.join(__dirname, 'public/images/default-event.jpg');
      return res.sendFile(defaultPath);
    }
    next();
  });
});

app.use('/uploads/gallery/:filename', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/uploads/gallery', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const defaultPath = path.join(__dirname, 'public/images/default-event.jpg');
      return res.sendFile(defaultPath);
    }
    next();
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║     🎉 EventPro Management System            ║
  ║     Server running on port ${PORT}           ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}    ║
  ║     URL: http://localhost:${PORT}            ║
  ╚══════════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;

const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })) 
      });
    }
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('back');
  }
  next();
};

// Registration Validation
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[+]?[0-9]{10,15}$/).withMessage('Please enter a valid phone number (10-15 digits)'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidation
];

// Login Validation
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidation
];

// Booking Validation
const bookingValidation = [
  body('eventDate')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  
  body('eventTime')
    .notEmpty().withMessage('Event time is required'),
  
  body('guestCount')
    .notEmpty().withMessage('Number of guests is required')
    .isInt({ min: 1, max: 10000 }).withMessage('Guest count must be between 1 and 10,000'),
  
  body('contactName')
    .trim()
    .notEmpty().withMessage('Contact name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Contact name must be 2-100 characters'),
  
  body('contactEmail')
    .trim()
    .notEmpty().withMessage('Contact email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('contactPhone')
    .trim()
    .notEmpty().withMessage('Contact phone is required')
    .matches(/^[+]?[0-9]{10,15}$/).withMessage('Invalid phone number'),
  
  body('selectedPackage')
    .notEmpty().withMessage('Please select a package'),
  
  body('specialRequirements')
    .optional()
    .isLength({ max: 2000 }).withMessage('Special requirements cannot exceed 2000 characters')
    .trim(),

  handleValidation
];

// Event Validation (Admin)
const eventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['wedding', 'birthday', 'corporate', 'concert', 'conference', 'anniversary', 'baby-shower', 'engagement', 'graduation', 'festival', 'charity', 'other'])
    .withMessage('Invalid category'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('basePrice')
    .notEmpty().withMessage('Base price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  handleValidation
];

// Contact Validation
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 1000 }).withMessage('Message too long'),

  handleValidation
];

// Sanitize input helper
const sanitizeInput = (req, res, next) => {
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  bookingValidation,
  eventValidation,
  contactValidation,
  sanitizeInput,
  handleValidation
};

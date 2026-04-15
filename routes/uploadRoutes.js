const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { isAdmin } = require('../middleware/adminAuth');
const { isAuthenticated } = require('../middleware/auth');

// Unified upload endpoints

// POST /api/upload - General file upload (requires authentication)
router.post('/upload', isAuthenticated, uploadController.uploadFiles);

// POST /api/upload/single - Single file upload (requires authentication)
router.post('/upload/single', isAuthenticated, uploadController.uploadSingle);

// POST /api/upload/test - Test upload endpoint (no authentication required for testing)
router.post('/upload/test', uploadController.uploadSingle);

// POST /api/upload/test-multiple - Test multiple files upload endpoint (no authentication required for testing)
router.post('/upload/test-multiple', uploadController.uploadFiles);

// POST /api/upload/admin - Admin file upload (requires admin access)
router.post('/upload/admin', isAdmin, uploadController.uploadFiles);

// GET /api/upload/:category/:filename - Get file information
router.get('/upload/:category/:filename', uploadController.getFileInfo);

// Category-specific upload endpoints for convenience

// Profile image upload
router.post('/upload/profile', isAuthenticated, (req, res, next) => {
  req.body.category = 'profile';
  req.body.fieldName = 'profileImage';
  next();
}, uploadController.uploadSingle);

// Event images upload
router.post('/upload/event', isAuthenticated, (req, res, next) => {
  req.body.category = 'event';
  next();
}, uploadController.uploadFiles);

// Gallery images upload
router.post('/upload/gallery', isAuthenticated, (req, res, next) => {
  req.body.category = 'gallery';
  next();
}, uploadController.uploadFiles);

// Booking document upload
router.post('/upload/booking', isAuthenticated, (req, res, next) => {
  req.body.category = 'booking';
  req.body.fieldName = 'bookingDocument';
  next();
}, uploadController.uploadSingle);

// Admin-specific category uploads
router.post('/upload/admin/profile', isAdmin, (req, res, next) => {
  req.body.category = 'profile';
  req.body.fieldName = 'profileImage';
  next();
}, uploadController.uploadSingle);

router.post('/upload/admin/event', isAdmin, (req, res, next) => {
  req.body.category = 'event';
  next();
}, uploadController.uploadFiles);

router.post('/upload/admin/gallery', isAdmin, (req, res, next) => {
  req.body.category = 'gallery';
  next();
}, uploadController.uploadFiles);

module.exports = router;

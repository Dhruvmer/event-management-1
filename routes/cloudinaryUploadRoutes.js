const express = require('express');
const router = express.Router();
const cloudinaryUploadController = require('../controllers/cloudinaryUploadController');
const { isAdmin } = require('../middleware/adminAuth');
const { isAuthenticated } = require('../middleware/auth');

// Cloudinary upload endpoints

// POST /api/cloudinary/upload - General file upload (requires authentication)
router.post('/cloudinary/upload', isAuthenticated, cloudinaryUploadController.uploadFiles);

// POST /api/cloudinary/upload/single - Single file upload (requires authentication)
router.post('/cloudinary/upload/single', isAuthenticated, cloudinaryUploadController.uploadSingle);

// POST /api/cloudinary/upload/test - Test upload endpoint (no authentication required for testing)
router.post('/cloudinary/upload/test', cloudinaryUploadController.uploadSingle);

// POST /api/cloudinary/upload/test-multiple - Test multiple files upload endpoint (no authentication required for testing)
router.post('/cloudinary/upload/test-multiple', cloudinaryUploadController.uploadFiles);

// POST /api/cloudinary/upload/admin - Admin file upload (requires admin access)
router.post('/cloudinary/upload/admin', isAdmin, cloudinaryUploadController.uploadFiles);

// DELETE /api/cloudinary/delete - Delete file from Cloudinary (requires authentication)
router.delete('/cloudinary/delete', isAuthenticated, cloudinaryUploadController.deleteFile);

// GET /api/cloudinary/upload/:category/:filename - Get file information
router.get('/cloudinary/upload/:category/:filename', cloudinaryUploadController.getFileInfo);

// Category-specific upload endpoints for convenience

// Profile image upload
router.post('/cloudinary/upload/profile', isAuthenticated, (req, res, next) => {
  req.body.category = 'profile';
  req.body.fieldName = 'profileImage';
  next();
}, cloudinaryUploadController.uploadSingle);

// Event images upload
router.post('/cloudinary/upload/event', isAuthenticated, (req, res, next) => {
  req.body.category = 'event';
  next();
}, cloudinaryUploadController.uploadFiles);

// Gallery images upload
router.post('/cloudinary/upload/gallery', isAuthenticated, (req, res, next) => {
  req.body.category = 'gallery';
  next();
}, cloudinaryUploadController.uploadFiles);

// Booking document upload
router.post('/cloudinary/upload/booking', isAuthenticated, (req, res, next) => {
  req.body.category = 'booking';
  req.body.fieldName = 'bookingDocument';
  next();
}, cloudinaryUploadController.uploadSingle);

// Admin-specific category uploads
router.post('/cloudinary/upload/admin/profile', isAdmin, (req, res, next) => {
  req.body.category = 'profile';
  req.body.fieldName = 'profileImage';
  next();
}, cloudinaryUploadController.uploadSingle);

router.post('/cloudinary/upload/admin/event', isAdmin, (req, res, next) => {
  req.body.category = 'event';
  next();
}, cloudinaryUploadController.uploadFiles);

router.post('/cloudinary/upload/admin/gallery', isAdmin, (req, res, next) => {
  req.body.category = 'gallery';
  next();
}, cloudinaryUploadController.uploadFiles);

module.exports = router;

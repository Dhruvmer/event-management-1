const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin, isAdminGuest } = require('../middleware/adminAuth');
const { eventUpload, galleryUpload, profileUpload } = require('../config/multer');

// Admin Login
router.get('/login', isAdminGuest, adminController.getAdminLogin);
router.post('/login', isAdminGuest, adminController.postAdminLogin);

// Protected Admin Routes
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/add', adminController.getAddUser);
router.post('/users/add', profileUpload, adminController.postAddUser);
router.get('/users/edit/:id', adminController.getEditUser);
router.post('/users/edit/:id', profileUpload, adminController.postEditUser);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

// Sessions
router.get('/sessions', adminController.getSessions);

// Bookings
router.get('/bookings', adminController.getBookings);
router.post('/bookings/:id/update-status', adminController.updateBookingStatus);

// Events
router.get('/events', adminController.getEvents);
router.get('/events/add', adminController.getAddEvent);
router.post('/events/add', eventUpload, adminController.postAddEvent);
router.get('/events/edit/:id', adminController.getEditEvent);
router.post('/events/edit/:id', eventUpload, adminController.postEditEvent);
router.post('/events/delete/:id', adminController.deleteEvent);

// Gallery
router.get('/gallery', adminController.getGallery);
router.get('/gallery/add', adminController.getAddGallery);
router.post('/gallery/add', galleryUpload, adminController.postAddGallery);
router.get('/gallery/edit/:id', adminController.getEditGallery);
router.post('/gallery/edit/:id', galleryUpload, adminController.postEditGallery);
router.post('/gallery/delete/:id', adminController.deleteGallery);

module.exports = router;

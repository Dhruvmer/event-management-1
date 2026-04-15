const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { profileUpload } = require('../config/multer');

// Public Routes
router.get('/auth/register', isGuest, authController.getRegister);
router.post('/auth/register', isGuest, profileUpload, registerValidation, authController.postRegister);
router.get('/auth/login', isGuest, authController.getLogin);
router.post('/auth/login', isGuest, loginValidation, authController.postLogin);

// Protected Routes
router.get('/auth/logout', authController.logout);
router.get('/auth/profile', isAuthenticated, authController.getProfile);
router.post('/auth/profile/update', isAuthenticated, profileUpload, authController.updateProfile);
router.post('/auth/profile/change-password', isAuthenticated, authController.changePassword);

module.exports = router;

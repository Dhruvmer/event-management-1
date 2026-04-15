const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middleware/auth');
const { bookingValidation } = require('../middleware/validation');
const { bookingUpload } = require('../config/multer');

// All routes require authentication
router.use(isAuthenticated);

router.get('/book/:eventSlug', bookingController.getBookingForm);
router.post('/create', bookingUpload, bookingValidation, bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/confirmation/:id', bookingController.getBookingConfirmation);
router.get('/download-pdf/:id', bookingController.downloadBookingPDF);
router.post('/cancel/:id', bookingController.cancelBooking);

module.exports = router;

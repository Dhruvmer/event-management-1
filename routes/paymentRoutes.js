const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/checkout/:bookingId', paymentController.getCheckout);
router.post('/verify', paymentController.verifyPayment);
router.post('/failed', paymentController.paymentFailed);

module.exports = router;

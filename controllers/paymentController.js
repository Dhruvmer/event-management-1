const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const BookingPDFGenerator = require('../utils/pdfGenerator');
const emailService = require('../utils/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
});

// GET - Checkout Page
exports.getCheckout = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user: req.session.user._id
    }).populate('event');

    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/my-bookings');
    }

    if (booking.paymentStatus === 'completed') {
      return res.redirect(`/bookings/confirmation/${booking._id}`);
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(booking.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        userId: req.session.user._id.toString(),
        eventName: booking.event?.title || 'Event Booking'
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.render('user/payment', {
      title: 'Payment - EventPro',
      booking,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      user: req.session.user,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    req.flash('error', 'Payment initialization failed. Please try again.');
    res.redirect('/bookings/my-bookings');
  }
};

// POST - Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demo_secret')
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Update booking
    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = 'completed';
    booking.status = 'confirmed';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAmount = booking.totalAmount;
    booking.paidAt = new Date();
    booking.confirmedAt = new Date();
    await booking.save();

    // Generate PDF (non-blocking)
    const pdfGen = new BookingPDFGenerator(booking);
    pdfGen.generate().then(async (pdfResult) => {
      booking.pdfPath = pdfResult.filePath;
      booking.pdfGeneratedAt = new Date();
      await booking.save();

      // Send confirmation email with PDF
      emailService.sendBookingConfirmation(booking, pdfResult.absolutePath).catch(console.error);
      emailService.sendPaymentReceipt(booking).catch(console.error);
    }).catch(console.error);

    res.json({
      success: true,
      message: 'Payment successful!',
      redirectUrl: `/bookings/confirmation/${booking._id}`
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support.'
    });
  }
};

// POST - Payment Failed
exports.paymentFailed = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.paymentStatus = 'failed';
      booking.statusHistory.push({
        status: 'payment_failed',
        note: 'Payment was not completed'
      });
      await booking.save();
    }

    res.json({
      success: false,
      message: 'Payment failed. Please try again.',
      redirectUrl: `/bookings/my-bookings`
    });
  } catch (error) {
    console.error('Payment failed handler error:', error);
    res.status(500).json({ success: false, message: 'Error processing failed payment' });
  }
};

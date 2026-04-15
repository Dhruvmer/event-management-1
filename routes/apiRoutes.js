const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { isApiAuthenticated } = require('../middleware/auth');

// Public API - Get Events
router.get('/events', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .select('title slug category shortDescription eventImage pricing.basePrice averageRating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public API - Get Event Detail
router.get('/events/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, isActive: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected API - Get User Bookings
router.get('/bookings', isApiAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EventPro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;

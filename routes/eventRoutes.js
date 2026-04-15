const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Landing Page
router.get('/home', eventController.getLandingPage);

// Events
router.get('/', eventController.getAllEvents);
router.get('/gallery', eventController.getGallery);
router.get('/gallery/:id', eventController.getGalleryDetail);
router.get('/:slug', eventController.getEventDetail);

module.exports = router;

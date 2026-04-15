const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Booking = require('../models/Booking');
const { getPagination, getCategoryName } = require('../utils/helpers');

// GET - Landing Page / Home
exports.getLandingPage = async (req, res) => {
  try {
    const [featuredEvents, recentGallery, stats] = await Promise.all([
      Event.find({ isActive: true, isFeatured: true }).limit(6).sort({ createdAt: -1 }),
      Gallery.find({ isActive: true, isFeatured: true }).limit(8).sort({ createdAt: -1 }),
      Promise.all([
        Event.countDocuments({ isActive: true }),
        Booking.countDocuments({ status: 'completed' }),
        Gallery.countDocuments({ isActive: true })
      ])
    ]);

    const testimonials = [
      { name: 'Priya Sharma', event: 'Wedding', rating: 5, comment: 'EventPro made our dream wedding come true! Every detail was perfect.', image: '/images/default-avatar.png' },
      { name: 'Rahul Patel', event: 'Corporate Event', rating: 5, comment: 'Professional team, amazing execution. Highly recommended for corporate events!', image: '/images/default-avatar.png' },
      { name: 'Anita Desai', event: 'Birthday Party', rating: 4, comment: 'My daughter\'s birthday party was absolutely magical. Thank you EventPro!', image: '/images/default-avatar.png' }
    ];

    res.render('user/landing', {
      title: 'EventPro - Professional Event Management',
      featuredEvents,
      recentGallery,
      totalEvents: stats[0],
      completedBookings: stats[1],
      galleryCount: stats[2],
      testimonials,
      getCategoryName,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Landing page error:', error);
    req.flash('error', 'Error loading page');
    res.render('user/landing', {
      title: 'EventPro - Professional Event Management',
      featuredEvents: [],
      recentGallery: [],
      totalEvents: 0,
      completedBookings: 0,
      galleryCount: 0,
      testimonials: [],
      getCategoryName,
      layout: 'layouts/main'
    });
  }
};

// GET - All Events
exports.getAllEvents = async (req, res) => {
  try {
    const { category, search, sort, page = 1 } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { 'pricing.basePrice': 1 };
    else if (sort === 'price-high') sortOption = { 'pricing.basePrice': -1 };
    else if (sort === 'popular') sortOption = { totalBookings: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };

    const total = await Event.countDocuments(filter);
    const pagination = getPagination(page, 9, total);

    const events = await Event.find(filter)
      .sort(sortOption)
      .skip(pagination.skip)
      .limit(pagination.perPage);

    const categories = await Event.distinct('category', { isActive: true });

    res.render('user/events', {
      title: 'Our Events - EventPro',
      events,
      categories,
      pagination,
      currentCategory: category || 'all',
      currentSort: sort || 'newest',
      searchQuery: search || '',
      getCategoryName,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Events listing error:', error);
    req.flash('error', 'Error loading events');
    res.redirect('/home');
  }
};

// GET - Single Event Detail
exports.getEventDetail = async (req, res) => {
  try {
    const event = await Event.findOne({
      slug: req.params.slug,
      isActive: true
    }).populate('reviews.user', 'firstName lastName profileImage');

    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    // Related events
    const relatedEvents = await Event.find({
      _id: { $ne: event._id },
      category: event.category,
      isActive: true
    }).limit(3);

    res.render('user/eventDetail', {
      title: `${event.title} - EventPro`,
      event,
      relatedEvents,
      getCategoryName,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Event detail error:', error);
    req.flash('error', 'Error loading event details');
    res.redirect('/events');
  }
};

// GET - Gallery Page
exports.getGallery = async (req, res) => {
  try {
    const { category, page = 1 } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    const total = await Gallery.countDocuments(filter);
    const pagination = getPagination(page, 12, total);

    const galleries = await Gallery.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    const categories = await Gallery.distinct('category', { isActive: true });

    res.render('user/gallery', {
      title: 'Gallery - EventPro',
      galleries,
      categories,
      pagination,
      currentCategory: category || 'all',
      getCategoryName,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Gallery error:', error);
    req.flash('error', 'Error loading gallery');
    res.redirect('/home');
  }
};

// GET - Gallery Detail Page
exports.getGalleryDetail = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery || !gallery.isActive) {
      req.flash('error', 'Gallery not found');
      return res.redirect('/events/gallery');
    }

    // Get related galleries
    const relatedGalleries = await Gallery.find({
      _id: { $ne: gallery._id },
      category: gallery.category,
      isActive: true
    }).limit(6);

    res.render('user/galleryDetail', {
      title: `${gallery.title} - Gallery - EventPro`,
      gallery,
      relatedGalleries,
      getCategoryName,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Gallery detail error:', error);
    req.flash('error', 'Error loading gallery');
    res.redirect('/events/gallery');
  }
};

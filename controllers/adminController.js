const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Gallery = require('../models/Gallery');
const SessionLog = require('../models/Session');
const { getPagination, getCategoryName, parseUserAgent, generateToken } = require('../utils/helpers');

// ============ DASHBOARD ============
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      recentBookings,
      recentUsers,
      bookingsByStatus,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.find().populate('user', 'firstName lastName email').populate('event', 'title category').sort({ createdAt: -1 }).limit(5),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const statusMap = {};
    bookingsByStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - EventPro',
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentBookings,
      recentUsers,
      statusMap,
      monthlyRevenue,
      getCategoryName,
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Error loading dashboard');
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalUsers: 0, totalEvents: 0, totalBookings: 0, totalRevenue: 0,
      recentBookings: [], recentUsers: [], statusMap: {}, monthlyRevenue: [],
      getCategoryName,
      layout: 'layouts/admin'
    });
  }
};

// ============ ADMIN LOGIN ============
exports.getAdminLogin = (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - EventPro',
    layout: 'layouts/admin-login'
  });
};

exports.postAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });

    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid admin credentials');
      return res.redirect('/admin/login');
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    user.authToken = generateToken(32);
    await user.save();

    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: 'admin',
      profileImage: user.profileImage,
      authToken: user.authToken
    };
    req.session.isAdmin = true;

    const uaInfo = parseUserAgent(req.headers['user-agent']);
    await SessionLog.create({
      user: user._id,
      sessionId: req.sessionID,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      browser: uaInfo.browser,
      os: uaInfo.os,
      device: uaInfo.device
    });

    req.flash('success', 'Welcome Admin!');
    res.redirect('/admin/dashboard');
  } catch (error) {
    req.flash('error', 'Login failed');
    res.redirect('/admin/login');
  }
};

// ============ USERS MANAGEMENT ============
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, status } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;

    const total = await User.countDocuments(filter);
    const pagination = getPagination(page, 15, total);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    res.render('admin/users', {
      title: 'User Management - EventPro',
      users,
      pagination,
      searchQuery: search || '',
      currentStatus: status || 'all',
      layout: 'layouts/admin'
    });
  } catch (error) {
    req.flash('error', 'Error loading users');
    res.redirect('/admin/dashboard');
  }
};

// Toggle User Status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
    res.redirect('/admin/users');
  } catch (error) {
    req.flash('error', 'Error updating user');
    res.redirect('/admin/users');
  }
};

// ============ SESSIONS MANAGEMENT ============
exports.getSessions = async (req, res) => {
  try {
    const { page = 1, status } = req.query;
    const filter = {};
    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;

    const total = await SessionLog.countDocuments(filter);
    const pagination = getPagination(page, 20, total);

    const sessions = await SessionLog.find(filter)
      .populate('user', 'firstName lastName email profileImage role')
      .sort({ loginAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    res.render('admin/sessions', {
      title: 'Session Management - EventPro',
      sessions,
      pagination,
      currentStatus: status || 'all',
      layout: 'layouts/admin'
    });
  } catch (error) {
    req.flash('error', 'Error loading sessions');
    res.redirect('/admin/dashboard');
  }
};

// ============ BOOKINGS MANAGEMENT ============
exports.getBookings = async (req, res) => {
  try {
    const { status, search, page = 1, payment } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (payment && payment !== 'all') filter.paymentStatus = payment;
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Booking.countDocuments(filter);
    const pagination = getPagination(page, 15, total);

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('event', 'title category')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    res.render('admin/bookings', {
      title: 'Booking Management - EventPro',
      bookings,
      pagination,
      currentStatus: status || 'all',
      currentPayment: payment || 'all',
      searchQuery: search || '',
      getCategoryName,
      layout: 'layouts/admin'
    });
  } catch (error) {
    req.flash('error', 'Error loading bookings');
    res.redirect('/admin/dashboard');
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/admin/bookings');
    }

    booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    if (status === 'confirmed') booking.confirmedAt = new Date();
    if (status === 'completed') booking.completedAt = new Date();
    if (status === 'cancelled') booking.cancelledAt = new Date();

    await booking.save();
    req.flash('success', 'Booking status updated successfully');
    res.redirect('/admin/bookings');
  } catch (error) {
    req.flash('error', 'Error updating booking');
    res.redirect('/admin/bookings');
  }
};

// ============ EVENTS MANAGEMENT ============
exports.getEvents = async (req, res) => {
  try {
    const { category, search, page = 1 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Event.countDocuments(filter);
    const pagination = getPagination(page, 10, total);

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    res.render('admin/events', {
      title: 'Event Management - EventPro',
      events,
      pagination,
      currentCategory: category || 'all',
      searchQuery: search || '',
      getCategoryName,
      layout: 'layouts/admin'
    });
  } catch (error) {
    req.flash('error', 'Error loading events');
    res.redirect('/admin/dashboard');
  }
};

// GET - Add Event
exports.getAddEvent = (req, res) => {
  res.render('admin/addEvent', {
    title: 'Add Event - EventPro',
    layout: 'layouts/admin'
  });
};

// POST - Add Event
exports.postAddEvent = async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      pricing: {
        basePrice: parseFloat(req.body.basePrice),
        premiumPrice: parseFloat(req.body.premiumPrice) || 0,
        luxuryPrice: parseFloat(req.body.luxuryPrice) || 0
      },
      venue: {
        name: req.body.venueName,
        address: req.body.venueAddress,
        city: req.body.venueCity,
        state: req.body.venueState,
        capacity: parseInt(req.body.venueCapacity) || 500
      },
      maxGuests: parseInt(req.body.maxGuests) || 500,
      duration: req.body.duration || 'Full Day',
      isActive: req.body.isActive === 'on',
      isFeatured: req.body.isFeatured === 'on',
      createdBy: req.session.user._id
    };

    // Parse packages
    if (req.body.packageNames) {
      const names = Array.isArray(req.body.packageNames) ? req.body.packageNames : [req.body.packageNames];
      const prices = Array.isArray(req.body.packagePrices) ? req.body.packagePrices : [req.body.packagePrices];
      const features = Array.isArray(req.body.packageFeatures) ? req.body.packageFeatures : [req.body.packageFeatures];

      eventData.packages = names.map((name, i) => ({
        name,
        price: parseFloat(prices[i]) || 0,
        features: features[i] ? features[i].split(',').map(f => f.trim()) : [],
        isPopular: i === 1
      }));
    }

    // Parse features
    if (req.body.featureTitles) {
      const titles = Array.isArray(req.body.featureTitles) ? req.body.featureTitles : [req.body.featureTitles];
      const descriptions = Array.isArray(req.body.featureDescriptions) ? req.body.featureDescriptions : [req.body.featureDescriptions];
      const icons = Array.isArray(req.body.featureIcons) ? req.body.featureIcons : [req.body.featureIcons];

      eventData.features = titles.map((title, i) => ({
        title,
        description: descriptions[i] || '',
        icon: icons[i] || 'fas fa-star'
      }));
    }

    // Parse includes/excludes
    if (req.body.includes) {
      eventData.includes = req.body.includes.split('\n').map(i => i.trim()).filter(Boolean);
    }
    if (req.body.excludes) {
      eventData.excludes = req.body.excludes.split('\n').map(i => i.trim()).filter(Boolean);
    }

    // Handle images
    if (req.files) {
      if (req.files.eventImage && req.files.eventImage[0]) {
        eventData.eventImage = '/uploads/events/' + req.files.eventImage[0].filename;
      }
      if (req.files.eventImages) {
        eventData.eventImages = req.files.eventImages.map(f => '/uploads/events/' + f.filename);
      }
    }

    await Event.create(eventData);
    req.flash('success', 'Event created successfully');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Add event error:', error);
    req.flash('error', error.message || 'Error creating event');
    res.redirect('/admin/events/add');
  }
};

// GET - Edit Event
exports.getEditEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/admin/events');
    }
    res.render('admin/editEvent', {
      title: 'Edit Event - EventPro',
      event,
      layout: 'layouts/admin'
    });
  } catch (error) {
    req.flash('error', 'Error loading event');
    res.redirect('/admin/events');
  }
};

// POST - Update Event
exports.postEditEvent = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      pricing: {
        basePrice: parseFloat(req.body.basePrice),
        premiumPrice: parseFloat(req.body.premiumPrice) || 0,
        luxuryPrice: parseFloat(req.body.luxuryPrice) || 0
      },
      venue: {
        name: req.body.venueName,
        address: req.body.venueAddress,
        city: req.body.venueCity,
        state: req.body.venueState,
        capacity: parseInt(req.body.venueCapacity) || 500
      },
      maxGuests: parseInt(req.body.maxGuests) || 500,
      duration: req.body.duration || 'Full Day',
      isActive: req.body.isActive === 'on',
      isFeatured: req.body.isFeatured === 'on'
    };

    if (req.files?.eventImage?.[0]) {
      updateData.eventImage = '/uploads/events/' + req.files.eventImage[0].filename;
    }
    if (req.files?.eventImages) {
      updateData.eventImages = req.files.eventImages.map(f => '/uploads/events/' + f.filename);
    }

    await Event.findByIdAndUpdate(req.params.id, updateData, { runValidators: true });
    req.flash('success', 'Event updated successfully');
    res.redirect('/admin/events');
  } catch (error) {
    req.flash('error', error.message || 'Error updating event');
    res.redirect(`/admin/events/edit/${req.params.id}`);
  }
};

// DELETE - Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { isActive: false });
    req.flash('success', 'Event deleted successfully');
    res.redirect('/admin/events');
  } catch (error) {
    req.flash('error', 'Error deleting event');
    res.redirect('/admin/events');
  }
};

// ============ GALLERY MANAGEMENT ============
exports.getGallery = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const total = await Gallery.countDocuments();
    const pagination = getPagination(page, 10, total);

    const galleries = await Gallery.find()
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    res.render('admin/gallery', {
      title: 'Gallery Management - EventPro',
      galleries,
      pagination,
      getCategoryName,
      layout: 'layouts/admin'
    });
  } catch (error) {
    req.flash('error', 'Error loading gallery');
    res.redirect('/admin/dashboard');
  }
};

// POST - Add Gallery
exports.postAddGallery = async (req, res) => {
  try {
    const galleryData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      venue: req.body.venue,
      client: req.body.client,
      eventDate: req.body.eventDate,
      isFeatured: req.body.isFeatured === 'on',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      createdBy: req.session.user._id,
      images: []
    };

    if (req.files) {
      galleryData.images = req.files.map((file, index) => ({
        url: '/uploads/gallery/' + file.filename,
        caption: '',
        order: index
      }));
    }

    await Gallery.create(galleryData);
    req.flash('success', 'Gallery added successfully');
    res.redirect('/admin/gallery');
  } catch (error) {
    req.flash('error', error.message || 'Error adding gallery');
    res.redirect('/admin/gallery');
  }
};

// DELETE - Delete Gallery
exports.deleteGallery = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    req.flash('success', 'Gallery deleted successfully');
    res.redirect('/admin/gallery');
  } catch (error) {
    req.flash('error', 'Error deleting gallery');
    res.redirect('/admin/gallery');
  }
};

// ============ USER MANAGEMENT ============

// GET - Add User Form
exports.getAddUser = (req, res) => {
  res.render('admin/addUser', {
    title: 'Add User - EventPro',
    layout: 'layouts/admin'
  });
};

// POST - Add User
exports.postAddUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, city, state, country } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      req.flash('error', 'User with this email or phone already exists');
      return res.redirect('/admin/users/add');
    }
    
    // Handle profile image
    let profileImage = '/images/default-avatar.png';
    if (req.file) {
      profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Hash password manually before creating user
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      profileImage,
      address: { city, state, country },
      role: 'user',
      isActive: true,
      isVerified: true
    });
    
    req.flash('success', `User ${user.firstName} ${user.lastName} added successfully`);
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Add user error:', error);
    req.flash('error', 'Error adding user');
    res.redirect('/admin/users/add');
  }
};

// GET - Edit User Form
exports.getEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    res.render('admin/editUser', {
      title: 'Edit User - EventPro',
      user,
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('Edit user error:', error);
    req.flash('error', 'Error loading user');
    res.redirect('/admin/users');
  }
};

// POST - Update User
exports.postEditUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, state, country } = req.body;
    const userId = req.params.id;
    
    // Check if email/phone is used by another user
    const existingUser = await User.findOne({ 
      _id: { $ne: userId },
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      req.flash('error', 'Email or phone already used by another user');
      return res.redirect(`/admin/users/edit/${userId}`);
    }
    
    // Update user
    const updateData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      address: { city, state, country }
    };
    
    // Handle profile image
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Only update password if provided - hash it manually
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }
    
    await User.findByIdAndUpdate(userId, updateData);
    
    req.flash('success', 'User updated successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Update user error:', error);
    req.flash('error', 'Error updating user');
    res.redirect(`/admin/users/edit/${req.params.id}`);
  }
};

// GET - Add Gallery Form
exports.getAddGallery = (req, res) => {
  res.render('admin/addGallery', {
    title: 'Add Gallery - EventPro',
    layout: 'layouts/admin'
  });
};

// GET - Edit Gallery Form
exports.getEditGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      req.flash('error', 'Gallery not found');
      return res.redirect('/admin/gallery');
    }
    
    res.render('admin/editGallery', {
      title: 'Edit Gallery - EventPro',
      gallery,
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('Edit gallery error:', error);
    req.flash('error', 'Error loading gallery');
    res.redirect('/admin/gallery');
  }
};

// POST - Update Gallery
exports.postEditGallery = async (req, res) => {
  try {
    const { title, description, category, venue, eventDate, isFeatured } = req.body;
    const galleryId = req.params.id;
    
    const updateData = {
      title,
      description,
      category,
      venue,
      eventDate: eventDate || null,
      isFeatured: isFeatured === 'true'
    };
    
    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/gallery/${file.filename}`,
        caption: file.originalname
      }));
      
      // Get existing gallery to preserve current images
      const existingGallery = await Gallery.findById(galleryId);
      if (existingGallery && existingGallery.images) {
        updateData.images = [...existingGallery.images, ...newImages];
      } else {
        updateData.images = newImages;
      }
    }
    
    await Gallery.findByIdAndUpdate(galleryId, updateData);
    
    req.flash('success', 'Gallery updated successfully');
    res.redirect('/admin/gallery');
  } catch (error) {
    console.error('Update gallery error:', error);
    req.flash('error', 'Error updating gallery');
    res.redirect(`/admin/gallery/edit/${req.params.id}`);
  }
};

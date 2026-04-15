const Booking = require('../models/Booking');
const Event = require('../models/Event');
const BookingPDFGenerator = require('../utils/pdfGenerator');
const emailService = require('../utils/emailService');
const { getPagination } = require('../utils/helpers');

// GET - Booking Form
exports.getBookingForm = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      req.flash('error', 'Please login to book an event');
      return res.redirect('/auth/login');
    }

    const event = await Event.findOne({
      slug: req.params.eventSlug,
      isActive: true
    });

    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    res.render('user/booking', {
      title: `Book ${event.title} - EventPro`,
      event,
      user: req.session.user,
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('Booking form error:', error);
    req.flash('error', 'Error loading booking form');
    res.redirect('/events');
  }
};

// POST - Create Booking
exports.createBooking = async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    // Parse selected package
    let selectedPackage;
    if (req.body.selectedPackage) {
      const pkgIndex = parseInt(req.body.selectedPackage);
      if (event.packages && event.packages[pkgIndex]) {
        selectedPackage = {
          name: event.packages[pkgIndex].name,
          price: event.packages[pkgIndex].price
        };
      } else {
        selectedPackage = {
          name: 'Basic Package',
          price: event.pricing.basePrice
        };
      }
    } else {
      selectedPackage = {
        name: 'Basic Package',
        price: event.pricing.basePrice
      };
    }

    // Parse additional services
    let additionalServices = [];
    if (req.body.additionalServices) {
      const services = Array.isArray(req.body.additionalServices)
        ? req.body.additionalServices
        : [req.body.additionalServices];
      additionalServices = services.map(s => {
        const [name, price] = s.split('|');
        return { name, price: parseFloat(price) || 0 };
      });
    }

    // Handle document upload
    let documents = [];
    if (req.file) {
      documents.push({
        name: req.file.originalname,
        path: '/uploads/bookings/' + req.file.filename
      });
    }

    // Calculate totals
    const servicesTotal = additionalServices.reduce((sum, s) => sum + s.price, 0);
    const subtotal = selectedPackage.price + servicesTotal;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmount = subtotal + tax;

    const booking = await Booking.create({
      user: req.session.user._id,
      event: event._id,
      eventDate: req.body.eventDate,
      eventTime: req.body.eventTime,
      guestCount: parseInt(req.body.guestCount),
      venueName: req.body.venueName,
      venueAddress: req.body.venueAddress,
      contactName: req.body.contactName,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      selectedPackage,
      additionalServices,
      specialRequirements: req.body.specialRequirements,
      documents,
      subtotal,
      tax,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Update event booking count
    await Event.findByIdAndUpdate(event._id, { $inc: { totalBookings: 1 } });

    // Redirect to payment
    res.redirect(`/payment/checkout/${booking._id}`);
  } catch (error) {
    console.error('Booking creation error:', error);
    req.flash('error', error.message || 'Booking failed. Please try again.');
    res.redirect('back');
  }
};

// GET - My Bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const filter = { user: req.session.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Booking.countDocuments(filter);
    const pagination = getPagination(page, 10, total);

    const bookings = await Booking.find(filter)
      .populate('event', 'title category eventImage slug')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    res.render('user/myBookings', {
      title: 'My Bookings - EventPro',
      bookings,
      pagination,
      currentStatus: status || 'all',
      layout: 'layouts/main'
    });
  } catch (error) {
    console.error('My bookings error:', error);
    req.flash('error', 'Error loading bookings');
    res.redirect('/home');
  }
};

// GET - Booking Confirmation
exports.getBookingConfirmation = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.session.user._id
    }).populate('event');

    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/my-bookings');
    }

    res.render('user/bookingConfirmation', {
      title: 'Booking Confirmation - EventPro',
      booking,
      layout: 'layouts/main'
    });
  } catch (error) {
    req.flash('error', 'Error loading confirmation');
    res.redirect('/bookings/my-bookings');
  }
};

// GET - Download Booking PDF
exports.downloadBookingPDF = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.session.user._id
    }).populate('event');

    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/my-bookings');
    }

    // Generate PDF
    const pdfGen = new BookingPDFGenerator(booking);
    const pdfResult = await pdfGen.generate();

    // Update booking with PDF path
    booking.pdfPath = pdfResult.filePath;
    booking.pdfGeneratedAt = new Date();
    await booking.save();

    // Send file
    res.download(pdfResult.absolutePath, pdfResult.fileName);
  } catch (error) {
    console.error('PDF generation error:', error);
    req.flash('error', 'Error generating PDF');
    res.redirect('/bookings/my-bookings');
  }
};

// POST - Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.session.user._id
    });

    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/my-bookings');
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      req.flash('error', 'This booking cannot be cancelled');
      return res.redirect('/bookings/my-bookings');
    }

    // Check 48 hours policy
    const eventDate = new Date(booking.eventDate);
    const hoursUntilEvent = (eventDate - new Date()) / (1000 * 60 * 60);
    if (hoursUntilEvent < 48) {
      req.flash('error', 'Bookings cannot be cancelled within 48 hours of the event');
      return res.redirect('/bookings/my-bookings');
    }

    booking.status = 'cancelled';
    booking.cancelReason = req.body.cancelReason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    req.flash('success', 'Booking cancelled successfully');
    res.redirect('/bookings/my-bookings');
  } catch (error) {
    req.flash('error', 'Error cancelling booking');
    res.redirect('/bookings/my-bookings');
  }
};

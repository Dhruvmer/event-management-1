const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => 'EVT-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for booking']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required for booking']
  },
  // Booking Details
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  eventTime: {
    type: String,
    required: [true, 'Event time is required']
  },
  guestCount: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [10000, 'Guest count cannot exceed 10000']
  },
  venueName: {
    type: String,
    trim: true
  },
  venueAddress: {
    type: String,
    trim: true
  },
  // Personal Details
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^[+]?[0-9]{10,15}$/, 'Invalid phone number']
  },
  // Package Selection
  selectedPackage: {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  // Additional Services
  additionalServices: [{
    name: String,
    price: Number
  }],
  specialRequirements: {
    type: String,
    maxlength: [2000, 'Special requirements cannot exceed 2000 characters']
  },
  // Documents
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'bank_transfer', 'cash', 'cheque'],
    default: 'razorpay'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAmount: {
    type: Number,
    default: 0
  },
  paidAt: Date,
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  cancelReason: String,
  cancelledAt: Date,
  confirmedAt: Date,
  completedAt: Date,
  // PDF
  pdfPath: String,
  pdfGeneratedAt: Date,
  // Notes
  adminNotes: String,
  // Tracking
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ paymentStatus: 1 });

// Pre-save - Calculate totals
bookingSchema.pre('save', function(next) {
  if (this.isModified('selectedPackage') || this.isModified('additionalServices')) {
    let servicesTotal = 0;
    if (this.additionalServices && this.additionalServices.length > 0) {
      servicesTotal = this.additionalServices.reduce((sum, s) => sum + (s.price || 0), 0);
    }
    this.subtotal = this.selectedPackage.price + servicesTotal;
    this.tax = Math.round(this.subtotal * 0.18 * 100) / 100; // 18% GST
    this.totalAmount = this.subtotal + this.tax - this.discount;
  }

  // Add to status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }

  next();
});

// Virtual - Is cancellable
bookingSchema.virtual('isCancellable').get(function() {
  return ['pending', 'confirmed'].includes(this.status) && 
         new Date(this.eventDate) > new Date(Date.now() + 48 * 60 * 60 * 1000);
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

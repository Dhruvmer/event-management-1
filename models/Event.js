const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: {
      values: ['wedding', 'birthday', 'corporate', 'concert', 'conference', 'anniversary', 'baby-shower', 'engagement', 'graduation', 'festival', 'charity', 'other'],
      message: '{VALUE} is not a valid event category'
    }
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  eventImage: {
    type: String,
    default: '/images/default-event.jpg'
  },
  eventImages: [{
    type: String
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    premiumPrice: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    luxuryPrice: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  packages: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    features: [String],
    isPopular: {
      type: Boolean,
      default: false
    }
  }],
  features: [{
    icon: String,
    title: String,
    description: String
  }],
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1']
    },
    mapLink: String
  },
  duration: {
    type: String,
    default: 'Full Day'
  },
  maxGuests: {
    type: Number,
    default: 500,
    min: [1, 'Must allow at least 1 guest']
  },
  includes: [String],
  excludes: [String],
  termsAndConditions: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
eventSchema.index({ slug: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isActive: 1, isFeatured: -1 });
eventSchema.index({ 'pricing.basePrice': 1 });

// Pre-save - Generate slug
eventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 250) + '...';
  }
  next();
});

// Virtual - Formatted price
eventSchema.virtual('formattedPrice').get(function() {
  return `₹${this.pricing.basePrice.toLocaleString('en-IN')}`;
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

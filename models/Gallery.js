const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['wedding', 'birthday', 'corporate', 'concert', 'conference', 'anniversary', 'baby-shower', 'engagement', 'graduation', 'festival', 'charity', 'other'],
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  eventDate: Date,
  venue: String,
  client: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

gallerySchema.index({ category: 1, isActive: 1 });
gallerySchema.index({ isFeatured: -1, createdAt: -1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;

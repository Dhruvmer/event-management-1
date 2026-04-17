require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');

const quickFixGallery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventmanagement');
    console.log('Connected to MongoDB');

    // Update all gallery items to use working default image
    const result = await Gallery.updateMany(
      { "images.url": { $regex: "^/uploads/" } },
      { 
        $set: { 
          "images.$.url": "/images/default-event.jpg"
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} gallery items`);
    console.log('Gallery items now use working default images!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing gallery:', error);
    process.exit(1);
  }
};

quickFixGallery();

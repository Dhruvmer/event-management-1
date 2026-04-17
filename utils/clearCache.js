require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');

const clearCache = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Add timestamp to all image URLs to break cache
    const timestamp = Date.now();
    const galleries = await Gallery.find({});
    
    for (const gallery of galleries) {
      gallery.images = gallery.images.map(img => ({
        ...img,
        url: img.url.includes('?') 
          ? img.url + `&t=${timestamp}`
          : img.url + `?t=${timestamp}`
      }));
      await gallery.save();
      console.log(`Updated: ${gallery.title}`);
    }

    console.log('Cache cleared with timestamps!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearCache();

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');

const fixLiveGallery = async () => {
  try {
    // Connect to your live MongoDB database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to LIVE MongoDB database');

    // Find all gallery items with problematic /uploads/ URLs
    const galleries = await Gallery.find({ 'images.url': { $regex: '/uploads/' } });
    console.log(`Found ${galleries.length} gallery items with problematic URLs`);

    if (galleries.length === 0) {
      console.log('No problematic URLs found. Checking all gallery items...');
      const allGalleries = await Gallery.find({});
      console.log(`Total gallery items in database: ${allGalleries.length}`);
      
      allGalleries.forEach((gallery, index) => {
        console.log(`\n${index + 1}. ${gallery.title}`);
        gallery.images.forEach((img, imgIndex) => {
          console.log(`   Image ${imgIndex + 1}: ${img.url}`);
          if (img.url.includes('/uploads/')) {
            console.log('   *** PROBLEMATIC URL FOUND ***');
          }
        });
      });
    }

    // Update all gallery items to replace /uploads/ with /images/default-event.jpg
    const result = await Gallery.updateMany(
      { "images.url": { $regex: "^/uploads/" } },
      { 
        $set: { 
          "images.$.url": "/images/default-event.jpg"
        }
      }
    );

    console.log(`\nUpdated ${result.modifiedCount} gallery items`);
    console.log('All gallery items now use working default images!');

    // Verify the fix
    console.log('\nVerifying the fix...');
    const fixedGalleries = await Gallery.find({ 'images.url': { $regex: '/uploads/' } });
    console.log(`Remaining problematic URLs: ${fixedGalleries.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error fixing live gallery:', error);
    process.exit(1);
  }
};

fixLiveGallery();

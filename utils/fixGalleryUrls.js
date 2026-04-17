require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');

const fixGalleryUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventmanagement');
    console.log('Connected to MongoDB');

    // Get all gallery items
    const galleries = await Gallery.find({});
    console.log(`Found ${galleries.length} gallery items`);

    // Update each gallery item with Cloudinary URLs
    for (const gallery of galleries) {
      let hasChanges = false;
      
      // Update image URLs from local to Cloudinary
      gallery.images = gallery.images.map(img => {
        if (img.url && img.url.startsWith('/uploads/')) {
          hasChanges = true;
          // Replace with a Cloudinary URL (you can update this with actual uploaded images)
          return {
            ...img,
            url: 'https://res.cloudinary.com/drjb16eum/image/upload/v1/event-management/gallery/placeholder.jpg'
          };
        }
        return img;
      });

      if (hasChanges) {
        await gallery.save();
        console.log(`Updated gallery: ${gallery.title}`);
      }
    }

    console.log('Gallery URLs fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing gallery URLs:', error);
    process.exit(1);
  }
};

fixGalleryUrls();

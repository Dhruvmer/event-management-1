const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Storage Configuration for different categories
const getStorage = (category = 'misc') => {
  const folderMap = {
    profile: 'profiles',
    event: 'events', 
    gallery: 'gallery',
    booking: 'bookings',
    misc: 'misc'
  };

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `event-management/${folderMap[category] || 'misc'}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${file.fieldname}-${uniqueSuffix}`;
      }
    }
  });
};

// Export configurations
module.exports = {
  cloudinary,
  getStorage,
  
  // Get storage for specific category
  profileStorage: getStorage('profile'),
  eventStorage: getStorage('event'),
  galleryStorage: getStorage('gallery'),
  bookingStorage: getStorage('booking'),
  miscStorage: getStorage('misc')
};

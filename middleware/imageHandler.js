const fs = require('fs');
const path = require('path');

// Middleware to handle missing image files
const handleMissingImages = (req, res, next) => {
  const originalSendFile = res.sendFile;
  
  res.sendFile = function(filePath, options, callback) {
    const fullPath = path.resolve(filePath);
    
    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist, check if it's an image file
        const ext = path.extname(filePath).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        if (imageExtensions.includes(ext)) {
          // Determine default image based on path
          let defaultImage = '/images/default-avatar.png';
          
          if (filePath.includes('events') || filePath.includes('gallery')) {
            defaultImage = '/images/default-event.jpg';
          }
          
          // Send default image instead
          const defaultPath = path.join(__dirname, '../public', defaultImage);
          return originalSendFile.call(this, defaultPath, options, callback);
        }
      }
      
      // File exists or not an image, proceed normally
      return originalSendFile.call(this, filePath, options, callback);
    });
  };
  
  next();
};

module.exports = handleMissingImages;

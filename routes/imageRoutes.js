const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve profile images with fallback
router.get('/profiles/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads/profiles', filename);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve default avatar
      const defaultPath = path.join(__dirname, '../public/images/default-avatar.png');
      return res.sendFile(defaultPath);
    }
    
    // File exists, serve it
    res.sendFile(filePath);
  });
});

// Serve event images with fallback
router.get('/events/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads/events', filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const defaultPath = path.join(__dirname, '../public/images/default-event.jpg');
      return res.sendFile(defaultPath);
    }
    
    res.sendFile(filePath);
  });
});

// Serve gallery images with fallback
router.get('/gallery/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads/gallery', filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const defaultPath = path.join(__dirname, '../public/images/default-event.jpg');
      return res.sendFile(defaultPath);
    }
    
    res.sendFile(filePath);
  });
});

module.exports = router;

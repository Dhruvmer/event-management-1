const upload = require('../config/multer').upload;
const path = require('path');

// Unified File Upload API
exports.uploadFiles = async (req, res) => {
  try {
    const { category = 'misc' } = req.body;
    
    // Determine upload configuration based on category
    let uploadConfig;
    let baseUrl;
    
    switch (category) {
      case 'profile':
        uploadConfig = upload.single('profileImage');
        baseUrl = '/uploads/profiles/';
        break;
      case 'event':
        uploadConfig = upload.fields([
          { name: 'eventImage', maxCount: 1 },
          { name: 'eventImages', maxCount: 10 }
        ]);
        baseUrl = '/uploads/events/';
        break;
      case 'gallery':
        uploadConfig = upload.array('galleryImages', 20);
        baseUrl = '/uploads/gallery/';
        break;
      case 'booking':
        uploadConfig = upload.single('bookingDocument');
        baseUrl = '/uploads/bookings/';
        break;
      default:
        uploadConfig = upload.array('files', 10);
        baseUrl = '/uploads/misc/';
    }

    // Handle the upload
    uploadConfig(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
          error: err
        });
      }

      // Process uploaded files and return URLs
      let uploadedFiles = [];
      
      if (req.files) {
        if (Array.isArray(req.files)) {
          // Multiple files array
          uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: baseUrl + file.filename
          }));
        } else if (typeof req.files === 'object') {
          // Multiple fields (like event images)
          Object.keys(req.files).forEach(fieldName => {
            const files = req.files[fieldName];
            if (Array.isArray(files)) {
              files.forEach(file => {
                uploadedFiles.push({
                  filename: file.filename,
                  originalName: file.originalname,
                  size: file.size,
                  mimetype: file.mimetype,
                  url: baseUrl + file.filename,
                  field: fieldName
                });
              });
            }
          });
        }
      } else if (req.file) {
        // Single file
        uploadedFiles = [{
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: baseUrl + req.file.filename
        }];
      }

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        category,
        files: uploadedFiles,
        count: uploadedFiles.length
      });
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload',
      error: error.message
    });
  }
};

// Single file upload (for quick uploads)
exports.uploadSingle = async (req, res) => {
  try {
    const { category = 'misc', fieldName = 'file' } = req.body;
    
    const uploadConfig = upload.single(fieldName);
    
    uploadConfig(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      let baseUrl;
      switch (category) {
        case 'profile': baseUrl = '/uploads/profiles/'; break;
        case 'event': baseUrl = '/uploads/events/'; break;
        case 'gallery': baseUrl = '/uploads/gallery/'; break;
        case 'booking': baseUrl = '/uploads/bookings/'; break;
        default: baseUrl = '/uploads/misc/';
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: baseUrl + req.file.filename
        }
      });
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload'
    });
  }
};

// Get file information
exports.getFileInfo = async (req, res) => {
  try {
    const { category, filename } = req.params;
    
    let baseUrl;
    switch (category) {
      case 'profile': baseUrl = '/uploads/profiles/'; break;
      case 'event': baseUrl = '/uploads/events/'; break;
      case 'gallery': baseUrl = '/uploads/gallery/'; break;
      case 'booking': baseUrl = '/uploads/bookings/'; break;
      default: baseUrl = '/uploads/misc/';
    }

    const filePath = path.join(__dirname, '../public', baseUrl, filename);
    const fs = require('fs');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    
    res.json({
      success: true,
      file: {
        filename,
        url: baseUrl + filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file information'
    });
  }
};

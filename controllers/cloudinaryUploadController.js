const multer = require('multer');
const { cloudinary, getStorage } = require('../config/cloudinary');
const { getCloudinaryStatus, isCloudinaryConfigured } = require('../config/cloudinarySetup');

// Cloudinary File Upload API
exports.uploadFiles = async (req, res) => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      const status = getCloudinaryStatus();
      return res.status(400).json({
        success: false,
        message: 'Cloudinary is not configured',
        error: status.message,
        setupInstructions: status.setupInstructions
      });
    }

    const { category = 'misc' } = req.body;
    
    // Get appropriate storage based on category
    const storage = getStorage(category);
    const upload = multer({ storage: storage });
    
    // Determine upload configuration based on category
    let uploadConfig;
    
    switch (category) {
      case 'profile':
        uploadConfig = upload.single('profileImage');
        break;
      case 'event':
        uploadConfig = upload.fields([
          { name: 'eventImage', maxCount: 1 },
          { name: 'eventImages', maxCount: 10 }
        ]);
        break;
      case 'gallery':
        uploadConfig = upload.array('galleryImages', 20);
        break;
      case 'booking':
        uploadConfig = upload.single('bookingDocument');
        break;
      default:
        uploadConfig = upload.array('files', 10);
    }

    // Handle the upload
    uploadConfig(req, res, (err) => {
      if (err) {
        console.error('Cloudinary upload error:', err);
        let errorMessage = err.message || 'File upload failed';
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'File size too large';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          errorMessage = 'Too many files';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = 'Unexpected field name';
        } else if (err.message && err.message.includes('file format not allowed')) {
          errorMessage = 'File format not allowed. Please use jpg, jpeg, png, webp, or gif';
        }
        
        return res.status(400).json({
          success: false,
          message: errorMessage,
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
            url: file.path, // Cloudinary URL
            publicId: file.filename // Cloudinary public_id
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
                  url: file.path, // Cloudinary URL
                  publicId: file.filename, // Cloudinary public_id
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
          url: req.file.path, // Cloudinary URL
          publicId: req.file.filename // Cloudinary public_id
        }];
      }

      res.json({
        success: true,
        message: 'Files uploaded successfully to Cloudinary',
        category,
        files: uploadedFiles,
        count: uploadedFiles.length
      });
    });
  } catch (error) {
    console.error('Cloudinary upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Cloudinary upload',
      error: error.message
    });
  }
};

// Single file upload (for quick uploads)
exports.uploadSingle = async (req, res) => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      const status = getCloudinaryStatus();
      return res.status(400).json({
        success: false,
        message: 'Cloudinary is not configured',
        error: status.message,
        setupInstructions: status.setupInstructions
      });
    }

    const { category = 'misc', fieldName = 'file' } = req.body;
    
    const storage = getStorage(category);
    const upload = multer({ storage: storage }).single(fieldName);
    
    upload(req, res, (err) => {
      if (err) {
        console.error('Cloudinary single upload error:', err);
        let errorMessage = err.message || 'File upload failed';
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'File size too large';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          errorMessage = 'Too many files';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = 'Unexpected field name';
        } else if (err.message && err.message.includes('file format not allowed')) {
          errorMessage = 'File format not allowed. Please use jpg, jpeg, png, webp, or gif';
        }
        
        return res.status(400).json({
          success: false,
          message: errorMessage,
          error: err
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'File uploaded successfully to Cloudinary',
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: req.file.path, // Cloudinary URL
          publicId: req.file.filename // Cloudinary public_id
        }
      });
    });
  } catch (error) {
    console.error('Cloudinary single upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Cloudinary upload'
    });
  }
};

// Delete file from Cloudinary
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully from Cloudinary'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete file from Cloudinary'
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file from Cloudinary'
    });
  }
};

// Get file information
exports.getFileInfo = async (req, res) => {
  try {
    const { category, filename } = req.params;
    
    // For Cloudinary, we can get file info using the public_id
    const result = await cloudinary.api.resource(filename);
    
    if (result) {
      res.json({
        success: true,
        file: {
          filename: result.public_id,
          url: result.secure_url,
          size: result.bytes,
          format: result.format,
          createdAt: result.created_at,
          resourceType: result.resource_type
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Get Cloudinary file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file information from Cloudinary'
    });
  }
};

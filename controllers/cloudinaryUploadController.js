const multer = require('multer');
const { cloudinary, getStorage } = require('../config/cloudinary');
const { getCloudinaryStatus, isCloudinaryConfigured } = require('../config/cloudinarySetup');

// Cloudinary File Upload API
exports.uploadFiles = async (req, res) => {
  try {
    console.log('☁️ Cloudinary Upload Request - Category:', req.body.category || 'misc');
    console.log('☁️ Request body:', req.body);
    console.log('☁️ Request files:', req.files);
    console.log('☁️ Request file:', req.file);
    
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      console.log('❌ Cloudinary not configured');
      const status = getCloudinaryStatus();
      return res.status(400).json({
        success: false,
        message: 'Cloudinary is not configured',
        error: status.message,
        setupInstructions: status.setupInstructions
      });
    }
    
    console.log('✅ Cloudinary is configured and ready');

    const { category = 'misc' } = req.body;
    
    // Get appropriate storage based on category
    console.log('☁️ Getting Cloudinary storage for category:', category);
    const storage = getStorage(category);
    const upload = multer({ storage: storage });
    
    // Determine upload configuration based on category
    let uploadConfig;
    
    console.log('☁️ Setting up upload configuration for:', category);
    switch (category) {
      case 'profile':
        uploadConfig = upload.single('profileImage');
        console.log('☁️ Using profile upload config');
        break;
      case 'event':
        uploadConfig = upload.fields([
          { name: 'eventImage', maxCount: 1 },
          { name: 'eventImages', maxCount: 10 }
        ]);
        console.log('☁️ Using event upload config');
        break;
      case 'gallery':
        uploadConfig = upload.array('galleryImages', 20);
        console.log('☁️ Using gallery upload config');
        break;
      case 'booking':
        uploadConfig = upload.single('bookingDocument');
        console.log('☁️ Using booking upload config');
        break;
      default:
        uploadConfig = upload.array('files', 10);
        console.log('☁️ Using misc upload config');
    }

    // Handle the upload
    console.log('☁️ Starting Cloudinary upload process...');
    uploadConfig(req, res, (err) => {
      if (err) {
        console.error('❌ Cloudinary upload error:', err);
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

      console.log('✅ Cloudinary upload completed successfully');
      console.log('☁️ Files after Cloudinary upload:', req.files);
      console.log('☁️ Single file after Cloudinary upload:', req.file);
      
      // Process uploaded files and return URLs
      let uploadedFiles = [];
      
      if (req.files) {
        console.log('☁️ Processing multiple files from Cloudinary...');
        if (Array.isArray(req.files)) {
          // Multiple files array
          console.log('☁️ Processing array of files from Cloudinary:', req.files.length, 'files');
          uploadedFiles = req.files.map((file, index) => {
            console.log(`☁️ Cloudinary File ${index + 1}:`, {
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              url: file.path,
              publicId: file.filename
            });
            return {
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              url: file.path, // Cloudinary URL
              publicId: file.filename // Cloudinary public_id
            };
          });
        } else if (typeof req.files === 'object') {
          // Multiple fields (like event images)
          console.log('☁️ Processing object with multiple fields from Cloudinary:', Object.keys(req.files));
          Object.keys(req.files).forEach(fieldName => {
            const files = req.files[fieldName];
            console.log(`☁️ Cloudinary Field '${fieldName}' has ${files.length} files`);
            if (Array.isArray(files)) {
              files.forEach((file, index) => {
                console.log(`☁️ Cloudinary ${fieldName} file ${index + 1}:`, {
                  filename: file.filename,
                  originalName: file.originalname,
                  size: file.size,
                  url: file.path
                });
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
        console.log('☁️ Processing single file from Cloudinary:', {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: req.file.path
        });
        uploadedFiles = [{
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: req.file.path, // Cloudinary URL
          publicId: req.file.filename // Cloudinary public_id
        }];
      } else {
        console.log('⚠️ No files found in Cloudinary request');
      }

      console.log('☁️ Sending Cloudinary response with', uploadedFiles.length, 'files');
      console.log('☁️ Cloudinary Response data:', {
        success: true,
        message: 'Files uploaded successfully to Cloudinary',
        category,
        count: uploadedFiles.length
      });
      
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
    console.log('☁️ Cloudinary Single Upload Request - Category:', req.body.category || 'misc');
    console.log('☁️ Field Name:', req.body.fieldName || 'file');
    console.log('☁️ Request body:', req.body);
    
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      console.log('❌ Cloudinary not configured for single upload');
      const status = getCloudinaryStatus();
      return res.status(400).json({
        success: false,
        message: 'Cloudinary is not configured',
        error: status.message,
        setupInstructions: status.setupInstructions
      });
    }
    
    console.log('✅ Cloudinary configured for single upload');

    const { category = 'misc', fieldName = 'file' } = req.body;
    
    console.log('☁️ Getting Cloudinary storage for single upload category:', category);
    const storage = getStorage(category);
    const upload = multer({ storage: storage }).single(fieldName);
    
    console.log('☁️ Starting Cloudinary single file upload process...');
    upload(req, res, (err) => {
      if (err) {
        console.error('❌ Cloudinary single upload error:', err);
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
        console.log('❌ No file found in Cloudinary single upload request');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      console.log('✅ Single file uploaded successfully to Cloudinary:', {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: req.file.path,
        publicId: req.file.filename
      });

      console.log('☁️ Sending Cloudinary single upload response');
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

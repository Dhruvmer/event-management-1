const upload = require('../config/multer').upload;
const path = require('path');

// Unified File Upload API
exports.uploadFiles = async (req, res) => {
  try {
    console.log('📤 Upload Files Request - Category:', req.body.category || 'misc');
    console.log('📤 Request body:', req.body);
    console.log('📤 Request files:', req.files);
    console.log('📤 Request file:', req.file);
    
    const { category = 'misc' } = req.body;
    
    // Determine upload configuration based on category
    let uploadConfig;
    let baseUrl;
    
    console.log('📤 Processing category:', category);
    
    switch (category) {
      case 'profile':
        uploadConfig = upload.single('profileImage');
        baseUrl = '/uploads/profiles/';
        console.log('📤 Using profile upload config');
        break;
      case 'event':
        uploadConfig = upload.fields([
          { name: 'eventImage', maxCount: 1 },
          { name: 'eventImages', maxCount: 10 }
        ]);
        baseUrl = '/uploads/events/';
        console.log('📤 Using event upload config');
        break;
      case 'gallery':
        uploadConfig = upload.array('galleryImages', 20);
        baseUrl = '/uploads/gallery/';
        console.log('📤 Using gallery upload config');
        break;
      case 'booking':
        uploadConfig = upload.single('bookingDocument');
        baseUrl = '/uploads/bookings/';
        console.log('📤 Using booking upload config');
        break;
      default:
        uploadConfig = upload.array('files', 10);
        baseUrl = '/uploads/misc/';
        console.log('📤 Using misc upload config');
    }

    // Handle the upload
    console.log('📤 Starting upload process...');
    uploadConfig(req, res, (err) => {
      if (err) {
        console.error('❌ Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
          error: err
        });
      }

      console.log('✅ Upload completed successfully');
      console.log('📤 Files after upload:', req.files);
      console.log('📤 Single file after upload:', req.file);
      
      // Process uploaded files and return URLs
      let uploadedFiles = [];
      
      if (req.files) {
        console.log('📤 Processing multiple files...');
        if (Array.isArray(req.files)) {
          // Multiple files array
          console.log('📤 Processing array of files:', req.files.length, 'files');
          uploadedFiles = req.files.map((file, index) => {
            console.log(`📤 File ${index + 1}:`, {
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype
            });
            return {
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              url: file.path && file.path.startsWith('http') ? file.path : baseUrl + file.filename
            };
          });
        } else if (typeof req.files === 'object') {
          // Multiple fields (like event images)
          console.log('📤 Processing object with multiple fields:', Object.keys(req.files));
          Object.keys(req.files).forEach(fieldName => {
            const files = req.files[fieldName];
            console.log(`📤 Field '${fieldName}' has ${files.length} files`);
            if (Array.isArray(files)) {
              files.forEach((file, index) => {
                console.log(`📤 ${fieldName} file ${index + 1}:`, {
                  filename: file.filename,
                  originalName: file.originalname,
                  size: file.size
                });
                uploadedFiles.push({
                  filename: file.filename,
                  originalName: file.originalname,
                  size: file.size,
                  mimetype: file.mimetype,
                  url: file.path && file.path.startsWith('http') ? file.path : baseUrl + file.filename,
                  field: fieldName
                });
              });
            }
          });
        }
      } else if (req.file) {
        // Single file
        console.log('📤 Processing single file:', {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
        uploadedFiles = [{
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: req.file.path && req.file.path.startsWith('http') ? req.file.path : baseUrl + req.file.filename
        }];
      } else {
        console.log('⚠️ No files found in request');
      }

      console.log('📤 Sending response with', uploadedFiles.length, 'files');
      console.log('📤 Response data:', {
        success: true,
        message: 'Files uploaded successfully',
        category,
        count: uploadedFiles.length
      });
      
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
    console.log('📤 Single Upload Request - Category:', req.body.category || 'misc');
    console.log('📤 Field Name:', req.body.fieldName || 'file');
    console.log('📤 Request body:', req.body);
    
    const { category = 'misc', fieldName = 'file' } = req.body;
    
    const uploadConfig = upload.single(fieldName);
    
    console.log('📤 Starting single file upload process...');
    uploadConfig(req, res, (err) => {
      if (err) {
        console.error('❌ Single upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }

      if (!req.file) {
        console.log('❌ No file found in single upload request');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      console.log('✅ Single file uploaded successfully:', {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

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
          url: req.file.path && req.file.path.startsWith('http') ? req.file.path : baseUrl + req.file.filename
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

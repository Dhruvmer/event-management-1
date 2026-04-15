const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'public/uploads/';
    if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'eventImage' || file.fieldname === 'eventImages') {
      uploadPath += 'events/';
    } else if (file.fieldname === 'galleryImages') {
      uploadPath += 'gallery/';
    } else if (file.fieldname === 'bookingDocument') {
      uploadPath += 'bookings/';
    } else {
      uploadPath += 'misc/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer Configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10
  }
});

// Export different upload configurations
module.exports = {
  single: (fieldName) => upload.single(fieldName),
  multiple: (fieldName, maxCount) => upload.array(fieldName, maxCount || 5),
  fields: (fieldsArray) => upload.fields(fieldsArray),
  profileUpload: upload.single('profileImage'),
  eventUpload: upload.fields([
    { name: 'eventImage', maxCount: 1 },
    { name: 'eventImages', maxCount: 10 }
  ]),
  galleryUpload: upload.array('galleryImages', 20),
  bookingUpload: upload.single('bookingDocument'),
  upload
};

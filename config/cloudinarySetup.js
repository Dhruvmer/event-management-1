// Cloudinary Setup Helper
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  return cloudName && apiKey && apiSecret && 
         cloudName !== 'demo' && apiKey !== 'demo' && apiSecret !== 'demo';
};

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  if (!isCloudinaryConfigured()) {
    return {
      success: false,
      message: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file'
    };
  }

  try {
    const result = await cloudinary.api.ping();
    return {
      success: true,
      message: 'Cloudinary connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: `Cloudinary connection failed: ${error.message}`
    };
  }
};

// Get Cloudinary status
const getCloudinaryStatus = () => {
  if (isCloudinaryConfigured()) {
    return {
      configured: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      message: 'Cloudinary is configured and ready'
    };
  } else {
    return {
      configured: false,
      message: 'Cloudinary is not configured. Using local storage instead.',
      setupInstructions: {
        step1: 'Sign up at https://cloudinary.com',
        step2: 'Get your credentials from Dashboard -> Settings -> API Keys',
        step3: 'Add these to your .env file:',
        envVars: [
          'CLOUDINARY_CLOUD_NAME=your_cloud_name',
          'CLOUDINARY_API_KEY=your_api_key',
          'CLOUDINARY_API_SECRET=your_api_secret'
        ]
      }
    };
  }
};

module.exports = {
  isCloudinaryConfigured,
  testCloudinaryConnection,
  getCloudinaryStatus,
  cloudinary
};

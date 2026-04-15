# Cloudinary Setup Guide

## Quick Setup

### 1. Get Cloudinary Credentials
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard -> Settings -> API Keys
3. Copy your:
   - Cloud Name
   - API Key  
   - API Secret

### 2. Update Environment Variables
Add these to your `.env` file:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Available Cloudinary Upload Endpoints

#### Test Endpoints (No Auth Required)
- `POST /api/cloudinary/upload/test` - Single file test
- `POST /api/cloudinary/upload/test-multiple` - Multiple files test

#### Authenticated Endpoints
- `POST /api/cloudinary/upload` - General upload
- `POST /api/cloudinary/upload/single` - Single file
- `POST /api/cloudinary/upload/profile` - Profile images
- `POST /api/cloudinary/upload/gallery` - Gallery images
- `POST /api/cloudinary/upload/event` - Event images
- `POST /api/cloudinary/upload/booking` - Booking documents

#### Admin Endpoints
- `POST /api/cloudinary/upload/admin/*` - Admin uploads

#### Management Endpoints
- `DELETE /api/cloudinary/delete` - Delete file
- `GET /api/cloudinary/upload/:category/:filename` - Get file info

## Usage Examples

### JavaScript Frontend Example
```javascript
// Upload single image to Cloudinary
async function uploadToCloudinary(file, category = 'gallery') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  try {
    const response = await fetch('/api/cloudinary/upload/single', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer ' + getAuthToken()
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Store Cloudinary URL
      const imageUrl = result.file.url;
      console.log('Cloudinary URL:', imageUrl);
      return imageUrl;
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Upload multiple gallery images
async function uploadGalleryToCloudinary(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('galleryImages', file);
  });
  formData.append('category', 'gallery');

  try {
    const response = await fetch('/api/cloudinary/upload/gallery', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      const imageUrls = result.files.map(file => file.url);
      console.log('Cloudinary URLs:', imageUrls);
      return imageUrls;
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Test with curl
```bash
# Test single file upload
curl -X POST http://localhost:3000/api/cloudinary/upload/test \
  -F "category=gallery" \
  -F "fieldName=file" \
  -F "file=@your-image.jpg"

# Test multiple files upload
curl -X POST http://localhost:3000/api/cloudinary/upload/test-multiple \
  -F "category=gallery" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

## Cloudinary vs Local Storage

| Feature | Cloudinary | Local Storage |
|---------|------------|---------------|
| **Setup** | Requires API keys | Works out of the box |
| **Storage** | Unlimited cloud storage | Limited by disk space |
| **Performance** | CDN optimized | Local server speed |
| **Image Processing** | Built-in transformations | Manual processing |
| **Backup** | Automatic | Manual backup needed |
| **Cost** | Free tier available | Free but limited |
| **Reliability** | 99.9% uptime | Depends on server |

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Files uploaded successfully to Cloudinary",
  "category": "gallery",
  "files": [
    {
      "filename": "galleryImages-1234567890",
      "originalName": "photo.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/event-management/gallery/galleryImages-1234567890.jpg",
      "publicId": "event-management/gallery/galleryImages-1234567890"
    }
  ],
  "count": 1
}
```

## Benefits of Cloudinary

1. **Automatic Image Optimization** - Compresses and optimizes images
2. **CDN Delivery** - Fast loading globally
3. **Image Transformations** - Resize, crop, filter on-the-fly
4. **Secure Storage** - Enterprise-grade security
5. **Analytics** - Detailed usage statistics
6. **Backup & Redundancy** - Automatic backups

## Migration from Local Storage

To migrate existing images:
1. Upload existing images to Cloudinary
2. Update database URLs to point to Cloudinary
3. Remove local files (optional)

## Troubleshooting

### Common Issues
1. **"Invalid credentials"** - Check Cloudinary API keys
2. **"File too large"** - Check file size limits
3. **"Unsupported format"** - Check allowed file types
4. **"Upload failed"** - Check network connection and API limits

### Debug Mode
Add this to see detailed Cloudinary logs:
```javascript
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  debug: true 
});
```

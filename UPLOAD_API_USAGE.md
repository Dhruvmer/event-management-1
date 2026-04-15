# Unified File Upload API Usage Guide

## Overview
The unified file upload API provides a single endpoint for uploading all types of files in your event management system. It returns URLs that can be stored in variables and used throughout your application.

## Available Endpoints

### 1. General Upload Endpoint
```
POST /api/upload
```
**Authentication Required:** Yes
**Categories:** profile, event, gallery, booking, misc

### 2. Single File Upload
```
POST /api/upload/single
```
**Authentication Required:** Yes

### 3. Category-Specific Uploads

#### Profile Image Upload
```
POST /api/upload/profile
```
**Field Name:** `profileImage`

#### Event Images Upload
```
POST /api/upload/event
```
**Field Names:** `eventImage` (single), `eventImages` (multiple)

#### Gallery Images Upload
```
POST /api/upload/gallery
```
**Field Name:** `galleryImages` (multiple)

#### Booking Document Upload
```
POST /api/upload/booking
```
**Field Name:** `bookingDocument`

### 4. Admin Upload Endpoints
```
POST /api/upload/admin
POST /api/upload/admin/profile
POST /api/upload/admin/event
POST /api/upload/admin/gallery
```
**Authentication Required:** Admin access

### 5. File Information
```
GET /api/upload/:category/:filename
```

## Usage Examples

### JavaScript/Frontend Example

```javascript
// Upload profile image
async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  try {
    const response = await fetch('/api/upload/profile', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': getCsrfToken() // if using CSRF protection
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store the URL in a variable
      const profileImageUrl = result.file.url;
      console.log('Profile image uploaded:', profileImageUrl);
      
      // Use the URL wherever needed
      document.getElementById('profilePreview').src = profileImageUrl;
      
      return profileImageUrl;
    } else {
      console.error('Upload failed:', result.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
}

// Upload multiple gallery images
async function uploadGalleryImages(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('galleryImages', file);
  });
  
  try {
    const response = await fetch('/api/upload/gallery', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store URLs in an array
      const imageUrls = result.files.map(file => file.url);
      console.log('Gallery images uploaded:', imageUrls);
      
      // Use the URLs
      imageUrls.forEach(url => {
        // Add to gallery, update UI, etc.
      });
      
      return imageUrls;
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
}
```

### Backend/Controller Integration

```javascript
// In your existing controllers, replace direct file handling with API calls

// Example: In event creation
exports.postAddEvent = async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      category: req.body.category,
      // ... other fields
    };

    // Instead of handling files directly, use the upload API
    if (req.body.eventImageUrl) {
      eventData.eventImage = req.body.eventImageUrl;
    }
    
    if (req.body.eventImageUrls) {
      eventData.eventImages = Array.isArray(req.body.eventImageUrls) 
        ? req.body.eventImageUrls 
        : [req.body.eventImageUrls];
    }

    await Event.create(eventData);
    req.flash('success', 'Event created successfully');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Add event error:', error);
    req.flash('error', error.message || 'Error creating event');
    res.redirect('/admin/events/add');
  }
};
```

### HTML Form Example

```html
<!-- Profile Image Upload Form -->
<form id="profileUploadForm">
  <input type="file" name="profileImage" accept="image/*" required>
  <button type="submit">Upload Profile Image</button>
</form>

<script>
document.getElementById('profileUploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const fileInput = e.target.querySelector('input[type="file"]');
  
  if (fileInput.files.length > 0) {
    const result = await uploadProfileImage(fileInput.files[0]);
    if (result) {
      // Store in hidden input or variable
      document.getElementById('profileImageUrl').value = result;
      // Show preview
      document.getElementById('preview').src = result;
    }
  }
});
</script>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "category": "gallery",
  "files": [
    {
      "filename": "galleryImages-abc123def456.jpg",
      "originalName": "photo.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "url": "/uploads/gallery/galleryImages-abc123def456.jpg"
    }
  ],
  "count": 1
}
```

### Error Response
```json
{
  "success": false,
  "message": "File upload failed",
  "error": "File type not allowed"
}
```

## File Categories and Storage Locations

| Category | Storage Path | URL Prefix | Max Files |
|----------|-------------|------------|-----------|
| profile | public/uploads/profiles/ | /uploads/profiles/ | 1 |
| event | public/uploads/events/ | /uploads/events/ | 11 (1 main + 10 additional) |
| gallery | public/uploads/gallery/ | /uploads/gallery/ | 20 |
| booking | public/uploads/bookings/ | /uploads/bookings/ | 1 |
| misc | public/uploads/misc/ | /uploads/misc/ | 10 |

## Integration Steps

1. **Update Forms:** Change your existing forms to use the new upload API
2. **Handle Responses:** Update frontend to store returned URLs in variables
3. **Modify Controllers:** Update controllers to use URLs instead of direct file handling
4. **Update Views:** Use stored URLs to display images
5. **Test:** Verify all upload functionality works correctly

## Benefits

- **Unified Interface:** Single API for all file uploads
- **Flexible:** Supports different file types and categories
- **URL-based:** Returns URLs that can be stored and used anywhere
- **Scalable:** Easy to extend with new categories
- **Secure:** Proper authentication and validation
- **Consistent:** Same response format for all uploads

# 🎉 EventPro - Professional Event Management System

A full-stack Node.js Event Management System with user registration, event booking, Razorpay payment integration, PDF confirmation generation, admin dashboard, and much more.

## 🚀 Features

### User Side
- ✅ User Registration with file upload & validation
- ✅ User Login with session management (64-char token)
- ✅ Landing Page with gallery, featured events, testimonials
- ✅ Event Listing with search, filter, sort, pagination
- ✅ Event Detail with packages, features, gallery
- ✅ Event Booking with form validation
- ✅ Razorpay Payment Integration
- ✅ PDF Booking Confirmation (auto-generated)
- ✅ Email Notifications (welcome, booking confirmation, payment receipt)
- ✅ User Profile Management
- ✅ My Bookings with status tracking
- ✅ Booking Cancellation

### Admin Side
- ✅ Admin Dashboard with charts (Chart.js)
- ✅ User Management (view, search, activate/deactivate)
- ✅ Session Logs (browser, OS, IP, device tracking)
- ✅ Booking Management (status update, search, filter)
- ✅ Event CRUD (add, edit, delete with image upload)
- ✅ Gallery Management (multi-image upload)
- ✅ Revenue Analytics

### Technical Features
- ✅ 64-character secure token authentication
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Express Rate Limiting
- ✅ Helmet security headers
- ✅ HPP (HTTP Parameter Pollution protection)
- ✅ XSS protection & input sanitization
- ✅ CSRF-safe session configuration
- ✅ File upload with Multer (type/size validation)
- ✅ Image processing with Sharp
- ✅ MongoDB with Mongoose ODM
- ✅ Session storage with connect-mongo
- ✅ Express-validator for all forms
- ✅ Responsive EJS templates with Bootstrap 5
- ✅ RESTful API endpoints
- ✅ Proper error handling (404, 500)
- ✅ Compression & caching

## 📁 Project Structure

```
event-management/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── multer.js             # File upload configuration
├── controllers/
│   ├── authController.js     # Auth (register, login, profile)
│   ├── eventController.js    # Events & Gallery
│   ├── bookingController.js  # Bookings & PDF
│   ├── paymentController.js  # Razorpay integration
│   └── adminController.js    # Admin panel operations
├── middleware/
│   ├── auth.js               # User authentication
│   ├── adminAuth.js          # Admin authentication
│   ├── validation.js         # Express-validator rules
│   └── errorHandler.js       # Error handling
├── models/
│   ├── User.js               # User model
│   ├── Event.js              # Event model
│   ├── Booking.js            # Booking model
│   ├── Gallery.js            # Gallery model
│   └── Session.js            # Session log model
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   ├── adminRoutes.js
│   └── apiRoutes.js
├── utils/
│   ├── pdfGenerator.js       # PDF generation with PDFKit
│   ├── emailService.js       # Email with Nodemailer
│   ├── helpers.js            # Utility functions
│   └── seeder.js             # Database seeder
├── views/
│   ├── layouts/              # EJS layouts
│   ├── partials/             # Navbar, Footer
│   ├── user/                 # User pages
│   ├── admin/                # Admin pages
│   └── errors/               # Error pages
├── public/
│   ├── css/style.css         # Custom styles
│   ├── js/main.js            # Client-side JS
│   ├── images/
│   └── uploads/              # User uploads
├── server.js                 # Entry point
├── render.yaml               # Render deployment config
├── package.json
├── .env.example
└── .gitignore
```

## 🛠️ Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Razorpay account (for payments)

### Setup

```bash
# Clone repository
git clone <repo-url>
cd event-management

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Seed database with sample data
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## 🔐 Default Credentials

| Role  | Email               | Password      |
|-------|---------------------|---------------|
| Admin | admin@eventpro.com  | Admin@123456  |
| User  | demo@eventpro.com   | Demo@123456   |

## 🌐 API Endpoints

### Public API
- `GET /api/events` - List events
- `GET /api/events/:slug` - Event details
- `GET /api/health` - Health check

### Protected API
- `GET /api/bookings` - User bookings (requires auth token)

## 🚀 Deploy to Render

1. Push code to GitHub
2. Connect GitHub repo on Render.com
3. Add environment variables in Render dashboard:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `RAZORPAY_KEY_ID` - Razorpay key
   - `RAZORPAY_KEY_SECRET` - Razorpay secret
   - `EMAIL_USER` - Gmail address
   - `EMAIL_PASS` - Gmail app password
   - `ADMIN_PASSWORD` - Admin password
4. Deploy!

Or use `render.yaml` for blueprint deployment.

## 📝 License

MIT License

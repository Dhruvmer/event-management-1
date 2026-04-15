require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventmanagement');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Gallery.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // // Create Admin User
    // const admin = await User.create({
    //   firstName: 'Admin',
    //   lastName: 'EventPro',
    //   email: process.env.ADMIN_EMAIL || 'admin@eventpro.com',
    //   phone: '+919876543210',
    //   password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    //   role: 'admin',
    //   isActive: true,
    //   isVerified: true,
    //   address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' }
    // });
    // console.log('👤 Admin user created:', admin.email);

    // // Create Demo User
    // const user = await User.create({
    //   firstName: 'Rahul',
    //   lastName: 'Sharma',
    //   email: 'demo@eventpro.com',
    //   phone: '+919876543211',
    //   password: 'Demo@123456',
    //   role: 'user',
    //   isActive: true,
    //   isVerified: true,
    //   address: { city: 'Delhi', state: 'Delhi', country: 'India' }
    // });
    // console.log('👤 Demo user created:', user.email);

    // // Create Events
    // const events = await Event.create([
    //   {
    //     title: 'Royal Wedding Celebration',
    //     category: 'wedding',
    //     description: 'Experience the wedding of your dreams with our Royal Wedding package. We handle everything from stunning venue decoration to exquisite catering, professional photography, and live entertainment. Our team of expert planners will ensure every detail is perfect for your special day.\n\nFrom the enchanting mandap decoration to the grand reception, we create an unforgettable celebration that reflects your unique love story. Our packages include traditional and modern themes, personalized invitations, and a dedicated coordinator.',
    //     shortDescription: 'Dream wedding packages with complete decoration, catering, photography & entertainment.',
    //     pricing: { basePrice: 150000, premiumPrice: 350000, luxuryPrice: 750000 },
    //     packages: [
    //       { name: 'Silver Package', price: 150000, features: ['Basic Decoration', 'Catering for 200', 'Photography', 'DJ Music'], isPopular: false },
    //       { name: 'Gold Package', price: 350000, features: ['Premium Decoration', 'Catering for 500', 'Photo + Video', 'Live Band', 'Fireworks'], isPopular: true },
    //       { name: 'Diamond Package', price: 750000, features: ['Luxury Decoration', 'Catering for 1000', 'Cinematic Video', 'Celebrity DJ', 'Fireworks', 'Destination Setup'], isPopular: false }
    //     ],
    //     features: [
    //       { icon: 'fas fa-paint-brush', title: 'Custom Theme', description: 'Personalized theme and decoration' },
    //       { icon: 'fas fa-utensils', title: 'Multi-Cuisine', description: 'Wide variety of food options' },
    //       { icon: 'fas fa-camera', title: 'Pro Photography', description: 'Cinematic photo and video' },
    //       { icon: 'fas fa-music', title: 'Live Entertainment', description: 'DJ, bands, and performers' }
    //     ],
    //     includes: ['Stage Decoration', 'Flower Arrangements', 'Catering & Beverages', 'Photography & Videography', 'DJ / Music System', 'Seating Arrangement', 'Invitation Cards', 'Event Coordinator'],
    //     excludes: ['Travel & Accommodation', 'Personal Shopping', 'Alcohol', 'External Decorators'],
    //     venue: { name: 'Grand Palace Hotel', address: 'MG Road', city: 'Mumbai', state: 'Maharashtra', capacity: 1000 },
    //     maxGuests: 1000,
    //     duration: 'Full Day (12 Hours)',
    //     isActive: true,
    //     isFeatured: true,
    //     totalBookings: 156,
    //     averageRating: 4.8,
    //     createdBy: admin._id
    //   },
    //   {
    //     title: 'Grand Birthday Bash',
    //     category: 'birthday',
    //     description: 'Make your birthday truly special with our Grand Birthday Bash package! Whether it\'s a kid\'s party, teen celebration, or milestone birthday, we create memorable experiences with themed decorations, custom cakes, entertainment, and exciting activities.\n\nOur team brings creativity and fun together to deliver an unforgettable birthday celebration.',
    //     shortDescription: 'Fun-filled birthday celebrations with themes, cakes, decorations & entertainment.',
    //     pricing: { basePrice: 25000, premiumPrice: 75000, luxuryPrice: 150000 },
    //     packages: [
    //       { name: 'Fun Package', price: 25000, features: ['Basic Decoration', 'Custom Cake', 'Snacks', 'Games'], isPopular: false },
    //       { name: 'Party Package', price: 75000, features: ['Theme Decoration', 'Designer Cake', 'Full Catering', 'DJ', 'Photo Booth'], isPopular: true },
    //       { name: 'VIP Package', price: 150000, features: ['Luxury Theme', 'Multi-Tier Cake', 'Premium Catering', 'Live Band', 'Fireworks', 'Return Gifts'], isPopular: false }
    //     ],
    //     venue: { name: 'Fun City Arena', address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', capacity: 300 },
    //     maxGuests: 300,
    //     duration: '6 Hours',
    //     isActive: true,
    //     isFeatured: true,
    //     totalBookings: 243,
    //     averageRating: 4.7,
    //     createdBy: admin._id
    //   },
    //   {
    //     title: 'Corporate Summit & Conference',
    //     category: 'corporate',
    //     description: 'Elevate your corporate events with our professional conference management services. From annual meetings to product launches, we provide comprehensive solutions including AV setup, catering, registration management, and branding.\n\nOur corporate events are designed to impress clients, motivate teams, and deliver impactful presentations.',
    //     shortDescription: 'Professional corporate event management with complete AV, catering & branding solutions.',
    //     pricing: { basePrice: 200000, premiumPrice: 500000, luxuryPrice: 1000000 },
    //     packages: [
    //       { name: 'Basic Corporate', price: 200000, features: ['Hall Setup', 'AV Equipment', 'Tea & Snacks', 'Registration Desk'], isPopular: false },
    //       { name: 'Executive Corporate', price: 500000, features: ['Premium Venue', 'Full AV Setup', 'Lunch + Snacks', 'Branding', 'Live Streaming'], isPopular: true },
    //       { name: 'Enterprise Corporate', price: 1000000, features: ['5-Star Venue', 'Complete AV', 'Multi-Cuisine Catering', 'Full Branding', 'Live Stream', 'After Party'], isPopular: false }
    //     ],
    //     venue: { name: 'Business Convention Center', address: 'BKC', city: 'Mumbai', state: 'Maharashtra', capacity: 2000 },
    //     maxGuests: 2000,
    //     duration: 'Full Day',
    //     isActive: true,
    //     isFeatured: true,
    //     totalBookings: 89,
    //     averageRating: 4.9,
    //     createdBy: admin._id
    //   },
    //   {
    //     title: 'Musical Concert Night',
    //     category: 'concert',
    //     description: 'Organize spectacular concert events with our concert management services. Professional stage setup, sound engineering, lighting design, and artist management.',
    //     shortDescription: 'Professional concert management with stage, sound, lighting & artist coordination.',
    //     pricing: { basePrice: 500000, premiumPrice: 1500000, luxuryPrice: 5000000 },
    //     packages: [
    //       { name: 'Stage Setup', price: 500000, features: ['Basic Stage', 'Sound System', 'Lighting', 'Security'], isPopular: false },
    //       { name: 'Concert Pro', price: 1500000, features: ['Premium Stage', 'Pro Sound', 'LED Lighting', 'Security', 'Backstage'], isPopular: true },
    //       { name: 'Arena Concert', price: 5000000, features: ['Grand Stage', 'JBL Line Array', 'Moving Lights', 'VIP Area', 'Full Production'], isPopular: false }
    //     ],
    //     maxGuests: 5000,
    //     duration: '8 Hours',
    //     isActive: true,
    //     isFeatured: true,
    //     totalBookings: 45,
    //     averageRating: 4.6,
    //     createdBy: admin._id
    //   },
    //   {
    //     title: 'Engagement Ceremony',
    //     category: 'engagement',
    //     description: 'Celebrate your engagement with elegance and joy. Beautiful ring ceremony setup, photo booth, catering, and memorable moments captured professionally.',
    //     shortDescription: 'Elegant engagement ceremony with beautiful setup, catering & photography.',
    //     pricing: { basePrice: 50000, premiumPrice: 125000, luxuryPrice: 300000 },
    //     packages: [
    //       { name: 'Simple Elegance', price: 50000, features: ['Decoration', 'Catering for 100', 'Photography'], isPopular: false },
    //       { name: 'Royal Engagement', price: 125000, features: ['Theme Decoration', 'Catering for 250', 'Photo + Video', 'DJ'], isPopular: true },
    //       { name: 'Grand Celebration', price: 300000, features: ['Luxury Setup', 'Catering for 500', 'Cinematic Video', 'Live Band', 'Fireworks'], isPopular: false }
    //     ],
    //     maxGuests: 500,
    //     duration: '6 Hours',
    //     isActive: true,
    //     isFeatured: false,
    //     totalBookings: 78,
    //     averageRating: 4.5,
    //     createdBy: admin._id
    //   },
    //   {
    //     title: 'Baby Shower Celebration',
    //     category: 'baby-shower',
    //     description: 'Welcome the little one with a beautiful baby shower celebration. Cute themed decorations, fun games, custom cake, and a memorable photo session.',
    //     shortDescription: 'Adorable baby shower setup with cute themes, games, custom cake & photo session.',
    //     pricing: { basePrice: 20000, premiumPrice: 50000, luxuryPrice: 100000 },
    //     packages: [
    //       { name: 'Sweet & Simple', price: 20000, features: ['Theme Decoration', 'Custom Cake', 'Snacks', 'Games'], isPopular: false },
    //       { name: 'Baby Bliss', price: 50000, features: ['Premium Theme', 'Designer Cake', 'Full Catering', 'Photo Booth', 'Return Gifts'], isPopular: true },
    //       { name: 'Grand Shower', price: 100000, features: ['Luxury Theme', 'Multi-Tier Cake', 'Premium Catering', 'Photography', 'Entertainment', 'Gifts'], isPopular: false }
    //     ],
    //     maxGuests: 150,
    //     duration: '4 Hours',
    //     isActive: true,
    //     isFeatured: false,
    //     totalBookings: 112,
    //     averageRating: 4.8,
    //     createdBy: admin._id
    //   }
    // ]);
    // console.log(`🎉 ${events.length} events created`);

    // Create Gallery Items
    await Gallery.create([
      {
        title: 'Sharma-Patel Wedding 2024',
        description: 'A grand wedding celebration at Grand Palace Hotel with 800 guests.',
        category: 'wedding',
        venue: 'Grand Palace Hotel, Mumbai',
        client: 'Sharma Family',
        isFeatured: true,
        tags: ['luxury', 'traditional', 'grand'],
        images: [
          { url: '/images/default-event.jpg', caption: 'Wedding Stage', order: 0 },
          { url: '/images/default-event.jpg', caption: 'Reception', order: 1 }
        ],
        createdBy: admin._id
      },
      {
        title: 'TechCorp Annual Meet 2024',
        description: 'Corporate annual meeting with 500 attendees at BKC Convention Center.',
        category: 'corporate',
        venue: 'BKC Convention Center',
        client: 'TechCorp India',
        isFeatured: true,
        tags: ['corporate', 'technology', 'conference'],
        images: [
          { url: '/images/default-event.jpg', caption: 'Conference Hall', order: 0 }
        ],
        createdBy: admin._id
      },
      {
        title: 'Little Aarav\'s 5th Birthday',
        description: 'Superhero themed birthday party with 100 kids and fun activities.',
        category: 'birthday',
        venue: 'Fun City Arena',
        client: 'Mehta Family',
        isFeatured: true,
        tags: ['kids', 'superhero', 'fun'],
        images: [
          { url: '/images/default-event.jpg', caption: 'Party Setup', order: 0 }
        ],
        createdBy: admin._id
      }
    ]);
    console.log('🖼️ Gallery items created');

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login: admin@eventpro.com / Admin@123456');
    console.log('Demo User:   demo@eventpro.com / Demo@123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedData();

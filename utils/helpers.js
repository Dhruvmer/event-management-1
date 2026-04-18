const crypto = require('crypto');

// Generate secure random token (64 characters)
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format currency
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, options = {}) => {
  const defaultOptions = { dateStyle: 'long' };
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

// Format date-time
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

// Parse user agent
const parseUserAgent = (userAgent) => {
  const ua = userAgent || '';
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Browser detection
  if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  // OS detection
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device detection
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'Tablet';

  return { browser, os, device };
};

// Pagination helper
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / perPage);
  const skip = (currentPage - 1) * perPage;

  return {
    currentPage,
    perPage,
    totalPages,
    total,
    skip,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// Slugify string
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Category display names
const categoryNames = {
  'wedding': '💒 Wedding',
  'birthday': '🎂 Birthday',
  'corporate': '🏢 Corporate',
  'concert': '🎵 Concert',
  'conference': '🎤 Conference',
  'anniversary': '💑 Anniversary',
  'baby-shower': '👶 Baby Shower',
  'engagement': '💍 Engagement',
  'graduation': '🎓 Graduation',
  'festival': '🎪 Festival',
  'charity': '💝 Charity',
  'other': '📌 Other'
};

const getCategoryName = (category) => {
  return categoryNames[category] || category;
};

// Category icons (separate from names for flexibility)
const categoryIcons = {
  'wedding': 'fas fa-heart',
  'birthday': 'fas fa-birthday-cake',
  'corporate': 'fas fa-briefcase',
  'concert': 'fas fa-music',
  'conference': 'fas fa-microphone',
  'anniversary': 'fas fa-ring',
  'baby-shower': 'fas fa-baby',
  'engagement': 'fas fa-gem',
  'graduation': 'fas fa-graduation-cap',
  'festival': 'fas fa-star',
  'charity': 'fas fa-hand-holding-heart',
  'other': 'fas fa-calendar'
};

const getCategoryIcon = (category) => {
  return categoryIcons[category] || 'fas fa-calendar';
};

module.exports = {
  generateToken,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseUserAgent,
  getPagination,
  slugify,
  categoryNames,
  getCategoryName,
  getCategoryIcon
};

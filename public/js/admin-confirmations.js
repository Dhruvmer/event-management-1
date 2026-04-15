// Global confirmation functions for admin actions
function confirmDelete(type, name, extra = '') {
  let message = `Are you sure you want to delete this ${type}?`;
  
  if (name) {
    message = `Are you sure you want to delete ${type}: "${name}"?`;
  }
  
  if (extra) {
    message += ` ${extra}`;
  }
  
  return confirm(message);
}

function confirmAction(action, type, name, extra = '') {
  let message = `Are you sure you want to ${action} this ${type}?`;
  
  if (name) {
    message = `Are you sure you want to ${action} ${type}: "${name}"?`;
  }
  
  if (extra) {
    message += ` ${extra}`;
  }
  
  return confirm(message);
}

function confirmBookingAction(action, bookingId) {
  const actions = {
    'confirm': 'Are you sure you want to confirm this booking?',
    'complete': 'Are you sure you want to mark this booking as completed?',
    'cancel': 'Are you sure you want to cancel this booking? This action cannot be undone.'
  };
  
  return confirm(actions[action] || `Are you sure you want to ${action} this booking?`);
}

function confirmUserAction(action, userName) {
  const actions = {
    'activate': 'Are you sure you want to activate this user?',
    'deactivate': 'Are you sure you want to deactivate this user?',
    'delete': 'Are you sure you want to delete this user? This action cannot be undone.'
  };
  
  let message = actions[action] || `Are you sure you want to ${action} this user?`;
  
  if (userName) {
    message = message.replace('this user', `user: "${userName}"`);
  }
  
  return confirm(message);
}

function confirmEventAction(action, eventName) {
  const actions = {
    'delete': `Are you sure you want to delete this event: "${eventName}"? This action cannot be undone and will remove all associated bookings.`,
    'update': 'Are you sure you want to update this event?'
  };
  
  return confirm(actions[action] || `Are you sure you want to ${action} this event?`);
}

function confirmGalleryAction(action, galleryName) {
  const actions = {
    'delete': 'Are you sure you want to delete this gallery? This action cannot be undone.',
    'update': 'Are you sure you want to update this gallery?'
  };
  
  let message = actions[action] || `Are you sure you want to ${action} this gallery?`;
  
  if (galleryName) {
    message = message.replace('this gallery', `gallery: "${galleryName}"`);
  }
  
  return confirm(message);
}

// SweetAlert Helper Functions
function confirmDelete(type, name, extra = '') {
  let message = `Are you sure you want to delete this ${type}?`;
  
  if (name) {
    message = `Are you sure you want to delete this ${type}: "${name}"?`;
  }
  
  if (extra) {
    message += ` ${extra}`;
  }
  
  return Swal.fire({
    title: 'Confirm Delete',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });
}

function confirmAction(action, type, name, extra = '') {
  let message = `Are you sure you want to ${action} this ${type}?`;
  
  if (name) {
    message = `Are you sure you want to ${action} this ${type}: "${name}"?`;
  }
  
  if (extra) {
    message += ` ${extra}`;
  }
  
  return Swal.fire({
    title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#6C63FF',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${action}!`,
    cancelButtonText: 'Cancel'
  });
}

function confirmBookingAction(action, bookingId) {
  const actions = {
    'confirm': 'Are you sure you want to confirm this booking?',
    'complete': 'Are you sure you want to mark this booking as completed?',
    'cancel': 'Are you sure you want to cancel this booking? This action cannot be undone.'
  };
  
  return Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Booking`,
    text: actions[action] || `Are you sure you want to ${action} this booking?`,
    icon: action === 'cancel' ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: action === 'cancel' ? '#dc3545' : '#6C63FF',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${action}!`,
    cancelButtonText: 'Cancel'
  });
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
  
  return Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
    text: message,
    icon: action === 'delete' ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: action === 'delete' ? '#dc3545' : '#6C63FF',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${action}!`,
    cancelButtonText: 'Cancel'
  });
}

function confirmEventAction(action, eventName) {
  const actions = {
    'delete': `Are you sure you want to delete this event: "${eventName}"? This action cannot be undone and will remove all associated bookings.`,
    'update': 'Are you sure you want to update this event?'
  };
  
  return Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Event`,
    text: actions[action] || `Are you sure you want to ${action} this event?`,
    icon: action === 'delete' ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: action === 'delete' ? '#dc3545' : '#6C63FF',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${action}!`,
    cancelButtonText: 'Cancel'
  });
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
  
  return Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Gallery`,
    text: message,
    icon: action === 'delete' ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: action === 'delete' ? '#dc3545' : '#6C63FF',
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${action}!`,
    cancelButtonText: 'Cancel'
  });
}

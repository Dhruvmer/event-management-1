const User = require('../models/User');
const SessionLog = require('../models/Session');
const emailService = require('../utils/emailService');
const { parseUserAgent, generateToken } = require('../utils/helpers');

// GET - Register Page
exports.getRegister = (req, res) => {
  res.render('user/register', {
    title: 'Register - EventPro',
    layout: 'layouts/auth'
  });
};

// POST - Register User
exports.postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, street, city, state, zipCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      req.flash('error', 'User with this email or phone already exists');
      return res.redirect('/auth/register');
    }

    // Handle profile image
    let profileImage = '/images/default-avatar.png';
    if (req.file) {
      profileImage = '/uploads/profiles/' + req.file.filename;
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      profileImage,
      address: { street, city, state, zipCode },
      authToken: generateToken(32)
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch(console.error);

    req.flash('success', 'Registration successful! Please login to continue.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', error.message || 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
};

// GET - Login Page
exports.getLogin = (req, res) => {
  res.render('user/login', {
    title: 'Login - EventPro',
    layout: 'layouts/auth'
  });
};

// POST - Login User
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Check if active
    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated. Please contact support.');
      return res.redirect('/auth/login');
    }

    // Update login info
    user.lastLogin = new Date();
    user.loginCount += 1;
    user.authToken = generateToken(32);
    await user.save();

    // Create session
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      role: user.role,
      authToken: user.authToken
    };
    req.session.isAdmin = user.role === 'admin';

    // Log session
    const uaInfo = parseUserAgent(req.headers['user-agent']);
    await SessionLog.create({
      user: user._id,
      sessionId: req.sessionID,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      browser: uaInfo.browser,
      os: uaInfo.os,
      device: uaInfo.device
    });

    // Redirect
    const returnTo = req.session.returnTo || '/home';
    delete req.session.returnTo;

    req.flash('success', `Welcome back, ${user.firstName}!`);

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }

    res.redirect(returnTo);
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/auth/login');
  }
};

// GET - Logout
exports.logout = async (req, res) => {
  try {
    // Update session log
    if (req.session.user) {
      await SessionLog.findOneAndUpdate(
        { user: req.session.user._id, sessionId: req.sessionID, isActive: true },
        { isActive: false, logoutAt: new Date() }
      );
    }

    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
      res.clearCookie('eventpro.sid');
      res.redirect('/auth/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/');
  }
};

// GET - Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/home');
    }
    res.render('user/profile', {
      title: 'My Profile - EventPro',
      user,
      layout: 'layouts/main'
    });
  } catch (error) {
    req.flash('error', 'Error loading profile');
    res.redirect('/home');
  }
};

// POST - Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, street, city, state, zipCode } = req.body;
    const updateData = {
      firstName,
      lastName,
      phone,
      address: { street, city, state, zipCode }
    };

    if (req.file) {
      updateData.profileImage = '/uploads/profiles/' + req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.session.user._id, updateData, { new: true, runValidators: true });

    // Update session
    req.session.user.firstName = user.firstName;
    req.session.user.lastName = user.lastName;
    req.session.user.fullName = user.fullName;
    req.session.user.phone = user.phone;
    if (req.file) req.session.user.profileImage = user.profileImage;

    req.flash('success', 'Profile updated successfully');
    res.redirect('/auth/profile');
  } catch (error) {
    req.flash('error', error.message || 'Profile update failed');
    res.redirect('/auth/profile');
  }
};

// POST - Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/auth/profile');
    }

    const user = await User.findById(req.session.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/auth/profile');
    }

    user.password = newPassword;
    await user.save();

    req.flash('success', 'Password changed successfully');
    res.redirect('/auth/profile');
  } catch (error) {
    req.flash('error', 'Password change failed');
    res.redirect('/auth/profile');
  }
};

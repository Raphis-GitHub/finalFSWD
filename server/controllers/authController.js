const User = require('../models/User');
const Session = require('../models/Session');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');
const crypto = require('crypto');

// Register user
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address
  });

  // Generate tokens
  const tokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Create session
  const session = await Session.create({
    userId: user._id,
    token: accessToken,
    refreshToken,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent') || 'Unknown',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  });

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences
      },
      accessToken,
      expiresIn: '15m'
    }
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to too many failed login attempts'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Create session
  const sessionExpiry = rememberMe 
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    : new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const session = await Session.create({
    userId: user._id,
    token: accessToken,
    refreshToken,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent') || 'Unknown',
    expiresAt: sessionExpiry
  });

  // Set refresh token as httpOnly cookie
  const cookieExpiry = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: cookieExpiry
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        lastLogin: user.lastLogin
      },
      accessToken,
      expiresIn: rememberMe ? '7d' : '15m'
    }
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not provided'
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find active session
    const session = await Session.findOne({
      refreshToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokenPayload = {
      userId: session.userId._id,
      email: session.userId.email,
      role: session.userId.role
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);

    // Update session
    session.token = accessToken;
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await session.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  const session = req.session;

  if (session) {
    // Deactivate session
    session.isActive = false;
    await session.save();
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Logout from all devices
const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Deactivate all sessions for user
  await Session.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out from all devices'
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist.productId')
    .populate('cart.productId');

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        wishlist: user.wishlist,
        cart: user.cart,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'phone', 'address', 'preferences'];
  const updates = {};

  // Filter allowed updates
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences
      }
    }
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Deactivate all other sessions
  await Session.updateMany(
    { userId: user._id, token: { $ne: req.session.token } },
    { isActive: false }
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Get active sessions
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    userId: req.user._id,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).select('-token -refreshToken').sort({ lastActivity: -1 });

  res.json({
    success: true,
    data: {
      sessions: sessions.map(session => ({
        id: session._id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        isCurrent: session._id.toString() === req.session._id.toString()
      }))
    }
  });
});

// Revoke session
const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findOne({
    _id: sessionId,
    userId: req.user._id,
    isActive: true
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  session.isActive = false;
  await session.save();

  res.json({
    success: true,
    message: 'Session revoked successfully'
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  revokeSession
};
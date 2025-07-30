const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');
const Session = require('../models/Session');

const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if session exists and is active
    const session = await Session.findOne({ 
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Get user details
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Update session activity
    await session.updateActivity();

    // Attach user to request
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

const checkAccountLock = async (req, res, next) => {
  try {
    if (req.user && req.user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);
    
    // Remove expired requests
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(userId, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    validRequests.push(now);
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkAccountLock,
  rateLimitByUser
};
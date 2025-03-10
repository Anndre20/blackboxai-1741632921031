const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    // Check if user exists
    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if user's email is verified
    if (!req.user.isEmailVerified) {
      return next(new ErrorResponse('Please verify your email address', 403));
    }

    // Check if user's subscription is active
    if (req.user.subscription.status !== 'active') {
      return next(new ErrorResponse('Subscription inactive or expired', 403));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check subscription type and limits
exports.checkSubscription = (requiredSubscription) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    // Check if user is on free trial
    const isOnFreeTrial = user.subscription.type === 'free' && 
      new Date() < new Date(user.subscription.endDate);

    // Check if user has required subscription
    const hasRequiredSubscription = 
      user.subscription.type === requiredSubscription || 
      user.subscription.type === 'premium';

    if (!isOnFreeTrial && !hasRequiredSubscription) {
      return next(
        new ErrorResponse(
          `This feature requires a ${requiredSubscription} subscription`,
          403
        )
      );
    }

    // Check storage limits based on subscription
    const storageLimit = {
      free: 1 * 1024 * 1024 * 1024, // 1GB
      basic: 10 * 1024 * 1024 * 1024, // 10GB
      premium: 100 * 1024 * 1024 * 1024 // 100GB
    };

    if (user.stats.storageUsed >= storageLimit[user.subscription.type]) {
      return next(
        new ErrorResponse(
          'Storage limit reached for your subscription tier',
          403
        )
      );
    }

    next();
  });
};

// Rate limiting middleware
exports.rateLimiter = (requests, minutes) => {
  const rateLimit = new Map();

  return (req, res, next) => {
    const userId = req.user.id;
    const now = Date.now();
    
    if (rateLimit.has(userId)) {
      const userData = rateLimit.get(userId);
      const windowStart = now - (minutes * 60 * 1000);
      
      // Filter out old requests
      userData.requests = userData.requests.filter(time => time > windowStart);
      
      if (userData.requests.length >= requests) {
        return next(
          new ErrorResponse(
            `Too many requests. Please try again in ${minutes} minutes`,
            429
          )
        );
      }
      
      userData.requests.push(now);
      rateLimit.set(userId, userData);
    } else {
      rateLimit.set(userId, {
        requests: [now]
      });
    }
    
    next();
  };
};

// Validate request body middleware
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    next();
  };
};

// Track API usage middleware
exports.trackApiUsage = asyncHandler(async (req, res, next) => {
  const user = req.user;
  
  // Increment API call count
  user.stats.apiCalls = (user.stats.apiCalls || 0) + 1;
  
  // Track last API call
  user.stats.lastApiCall = new Date();
  
  await user.save();
  
  next();
});

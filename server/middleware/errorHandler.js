const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`Error: ${err.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new Error(message);
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new Error(message);
    error.statusCode = 401;
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry detected';
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referenced record does not exist';
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    const message = 'Cannot delete record as it is referenced by other records';
    error = new Error(message);
    error.statusCode = 400;
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Payment errors
  if (err.type === 'StripeCardError') {
    const message = err.message || 'Payment failed';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error.statusCode = 429;
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Security: Don't leak error details in production
  const errorResponse = {
    success: false,
    message
  };

  // Add more details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = {
      name: err.name,
      code: err.code,
      stack: err.stack
    };
  }

  // Add error ID for tracking
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  errorResponse.errorId = errorId;

  // Log error with ID for debugging
  console.error(`Error ID: ${errorId}, Status: ${statusCode}, Message: ${message}`);

  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};
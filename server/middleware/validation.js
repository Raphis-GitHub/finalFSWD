const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('address.street')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Street address is too long'),
    body('address.city')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('City name is too long'),
    body('address.state')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('State name is too long'),
    body('address.zipCode')
      .optional()
      .isPostalCode('any')
      .withMessage('Please provide a valid zip code'),
    handleValidationErrors
  ]
};

// Product validation rules
const productValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Product name is required and must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category is required and must be less than 100 characters'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Please provide a valid image URL'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Product name must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Please provide a valid image URL'),
    handleValidationErrors
  ]
};

// Order validation rules
const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.product_id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('shipping_address')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Shipping address is required and must be between 10 and 500 characters'),
    body('payment_method')
      .isIn(['credit_card', 'debit_card', 'paypal', 'stripe'])
      .withMessage('Invalid payment method'),
    body('order_notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Order notes must be less than 1000 characters'),
    handleValidationErrors
  ],

  updateStatus: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer'),
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    body('tracking_number')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Tracking number must be less than 100 characters'),
    handleValidationErrors
  ]
};

// Common validation rules
const commonValidation = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['created_at', 'updated_at', 'name', 'price', 'rating'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC'),
    handleValidationErrors
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category must be between 1 and 100 characters'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    handleValidationErrors
  ]
};

// File upload validation
const fileValidation = {
  image: [
    body('maxSize')
      .optional()
      .isInt({ min: 1, max: 10485760 }) // 10MB max
      .withMessage('Max size must be between 1 byte and 10MB'),
    handleValidationErrors
  ]
};

module.exports = {
  userValidation,
  productValidation,
  orderValidation,
  commonValidation,
  fileValidation,
  handleValidationErrors
};
const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getCategories,
  getFeaturedProducts,
  getTopRatedProducts,
  addProductReview,
  getStockReport
} = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { productValidation, commonValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', commonValidation.pagination, commonValidation.search, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/top-rated', getTopRatedProducts);
router.get('/categories', getCategories);
router.get('/:id', commonValidation.id, getProduct);

// Protected routes (require authentication)
router.post('/:id/reviews', 
  authenticate,
  commonValidation.id,
  [
    require('express-validator').body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    require('express-validator').body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment must be less than 1000 characters'),
    require('../middleware/validation').handleValidationErrors
  ],
  addProductReview
);

// Admin only routes
router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.post('/', productValidation.create, createProduct);
router.put('/:id', productValidation.update, updateProduct);
router.delete('/:id', commonValidation.id, deleteProduct);
router.put('/:id/stock', 
  commonValidation.id,
  [
    require('express-validator').body('quantity')
      .isInt()
      .withMessage('Quantity must be an integer'),
    require('express-validator').body('changeType')
      .optional()
      .isIn(['stock_in', 'stock_out', 'adjustment'])
      .withMessage('Invalid change type'),
    require('express-validator').body('reason')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Reason must be less than 255 characters'),
    require('../middleware/validation').handleValidationErrors
  ],
  updateStock
);
router.get('/admin/stock-report', getStockReport);

module.exports = router;
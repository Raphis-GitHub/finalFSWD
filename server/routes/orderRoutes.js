const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  getRevenueAnalytics,
  getTopCustomers
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { orderValidation, commonValidation } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', orderValidation.create, createOrder);
router.get('/my-orders', commonValidation.pagination, getUserOrders);
router.get('/:id', commonValidation.id, getOrder);
router.put('/:id/cancel', 
  commonValidation.id,
  [
    require('express-validator').body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters'),
    require('../middleware/validation').handleValidationErrors
  ],
  cancelOrder
);

// Admin/Manager routes
router.get('/', 
  authorize('admin', 'manager'),
  commonValidation.pagination,
  [
    require('express-validator').query('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    require('express-validator').query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    require('express-validator').query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    require('../middleware/validation').handleValidationErrors
  ],
  getAllOrders
);

router.put('/:id/status', 
  authorize('admin', 'manager'),
  orderValidation.updateStatus,
  updateOrderStatus
);

router.get('/admin/stats', 
  authorize('admin', 'manager'),
  [
    require('express-validator').query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    require('express-validator').query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    require('../middleware/validation').handleValidationErrors
  ],
  getOrderStats
);

router.get('/admin/revenue', 
  authorize('admin', 'manager'),
  [
    require('express-validator').query('period')
      .optional()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Invalid period'),
    require('express-validator').query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    require('../middleware/validation').handleValidationErrors
  ],
  getRevenueAnalytics
);

router.get('/admin/top-customers', 
  authorize('admin', 'manager'),
  [
    require('express-validator').query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    require('../middleware/validation').handleValidationErrors
  ],
  getTopCustomers
);

module.exports = router;
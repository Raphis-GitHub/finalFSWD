const express = require('express');
const {
  uploadAvatar,
  uploadProductImage,
  uploadProductImages,
  uploadCategoryImage,
  deleteFile,
  getFileInfo,
  listFiles
} = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadConfigs, handleUploadError, validateFileUploads } = require('../middleware/upload');

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

// Avatar upload (any authenticated user)
router.post('/avatar', 
  uploadConfigs.avatar,
  handleUploadError,
  uploadAvatar
);

// Product image uploads (admin/manager only)
router.post('/product-image',
  authorize('admin', 'manager'),
  uploadConfigs.productImage,
  handleUploadError,
  uploadProductImage
);

router.post('/product-images',
  authorize('admin', 'manager'),
  uploadConfigs.productImages,
  handleUploadError,
  uploadProductImages
);

// Category image upload (admin/manager only)
router.post('/category-image',
  authorize('admin', 'manager'),
  uploadConfigs.categoryImage,
  handleUploadError,
  uploadCategoryImage
);

// File management routes
router.get('/files',
  authorize('admin', 'manager'),
  [
    require('express-validator').query('type')
      .optional()
      .isIn(['all', 'avatar', 'product', 'category', 'misc'])
      .withMessage('Invalid file type'),
    require('express-validator').query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    require('express-validator').query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    require('../middleware/validation').handleValidationErrors
  ],
  listFiles
);

router.get('/files/:filename',
  authorize('admin', 'manager'),
  [
    require('express-validator').param('filename')
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage('Invalid filename format'),
    require('../middleware/validation').handleValidationErrors
  ],
  getFileInfo
);

router.delete('/files/:filename',
  authorize('admin', 'manager'),
  [
    require('express-validator').param('filename')
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage('Invalid filename format'),
    require('../middleware/validation').handleValidationErrors
  ],
  deleteFile
);

module.exports = router;
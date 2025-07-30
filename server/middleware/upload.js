const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Create subdirectories based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'productImage') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'categoryImage') {
      uploadPath += 'categories/';
    } else {
      uploadPath += 'misc/';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Base upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per request
  }
});

// Specific upload configurations
const uploadConfigs = {
  // Single avatar upload
  avatar: upload.single('avatar'),
  
  // Single product image upload
  productImage: upload.single('productImage'),
  
  // Multiple product images upload
  productImages: upload.array('productImages', 5),
  
  // Category image upload
  categoryImage: upload.single('categoryImage'),
  
  // Generic file upload
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple files upload
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  
  // Mixed files upload
  fields: (fields) => upload.fields(fields)
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 5MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum 5 files allowed.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in the request.';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long.';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long.';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields.';
        break;
    }
    
    return res.status(400).json({
      success: false,
      message,
      error: {
        code: error.code,
        field: error.field
      }
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to delete uploaded files
const deleteUploadedFiles = (files) => {
  if (!files) return;
  
  const filesToDelete = Array.isArray(files) ? files : [files];
  
  filesToDelete.forEach(file => {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting file:', file.path, err);
        }
      });
    }
  });
};

// Helper function to get file URL
const getFileUrl = (req, filename) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

// Image optimization middleware (basic)
const optimizeImage = async (req, res, next) => {
  // This is a placeholder for image optimization
  // In production, you might want to use Sharp or similar library
  // to resize, compress, and optimize images
  next();
};

// Validate file uploads
const validateFileUploads = (req, res, next) => {
  if (!req.files && !req.file) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadConfigs,
  handleUploadError,
  deleteUploadedFiles,
  getFileUrl,
  optimizeImage,
  validateFileUploads
};
const { asyncHandler } = require('../middleware/errorHandler');
const { getFileUrl, deleteUploadedFiles } = require('../middleware/upload');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Upload avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const avatarUrl = getFileUrl(req, req.file.filename);
  
  // Update user avatar in database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  ).select('-password');

  // Delete old avatar if exists
  if (req.user.avatar && req.user.avatar !== avatarUrl) {
    const oldAvatarPath = req.user.avatar.replace(`${req.protocol}://${req.get('host')}/`, '');
    const fullPath = path.join(process.cwd(), oldAvatarPath);
    
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting old avatar:', err);
      }
    });
  }

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }
  });
});

// Upload product image
const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const imageUrl = getFileUrl(req, req.file.filename);

  res.json({
    success: true,
    message: 'Product image uploaded successfully',
    data: {
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    }
  });
});

// Upload multiple product images
const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const imageUrls = req.files.map(file => ({
    url: getFileUrl(req, file.filename),
    filename: file.filename,
    originalName: file.originalname,
    size: file.size
  }));

  res.json({
    success: true,
    message: `${req.files.length} product images uploaded successfully`,
    data: {
      images: imageUrls,
      count: req.files.length
    }
  });
});

// Upload category image
const uploadCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const imageUrl = getFileUrl(req, req.file.filename);

  res.json({
    success: true,
    message: 'Category image uploaded successfully',
    data: {
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    }
  });
});

// Delete uploaded file
const deleteFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({
      success: false,
      message: 'Filename is required'
    });
  }

  // Security check: ensure filename doesn't contain path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid filename'
    });
  }

  // Check multiple possible paths
  const possiblePaths = [
    path.join(process.cwd(), 'uploads', 'avatars', filename),
    path.join(process.cwd(), 'uploads', 'products', filename),
    path.join(process.cwd(), 'uploads', 'categories', filename),
    path.join(process.cwd(), 'uploads', 'misc', filename)
  ];

  let fileDeleted = false;
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        fileDeleted = true;
        break;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  if (!fileDeleted) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});

// Get file info
const getFileInfo = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({
      success: false,
      message: 'Filename is required'
    });
  }

  // Security check
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid filename'
    });
  }

  // Check multiple possible paths
  const possiblePaths = [
    { path: path.join(process.cwd(), 'uploads', 'avatars', filename), type: 'avatar' },
    { path: path.join(process.cwd(), 'uploads', 'products', filename), type: 'product' },
    { path: path.join(process.cwd(), 'uploads', 'categories', filename), type: 'category' },
    { path: path.join(process.cwd(), 'uploads', 'misc', filename), type: 'misc' }
  ];

  let fileInfo = null;
  
  for (const { path: filePath, type } of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        fileInfo = {
          filename,
          type,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: getFileUrl(req, filename)
        };
        break;
      }
    } catch (error) {
      console.error('Error getting file stats:', error);
    }
  }

  if (!fileInfo) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  res.json({
    success: true,
    data: fileInfo
  });
});

// List uploaded files (Admin only)
const listFiles = asyncHandler(async (req, res) => {
  const { type = 'all', page = 1, limit = 20 } = req.query;
  
  const uploadDirs = [
    { path: 'uploads/avatars', type: 'avatar' },
    { path: 'uploads/products', type: 'product' },
    { path: 'uploads/categories', type: 'category' },
    { path: 'uploads/misc', type: 'misc' }
  ];

  const files = [];
  
  for (const { path: dirPath, type: fileType } of uploadDirs) {
    if (type !== 'all' && type !== fileType) continue;
    
    const fullPath = path.join(process.cwd(), dirPath);
    
    try {
      if (fs.existsSync(fullPath)) {
        const dirFiles = fs.readdirSync(fullPath);
        
        for (const filename of dirFiles) {
          const filePath = path.join(fullPath, filename);
          const stats = fs.statSync(filePath);
          
          files.push({
            filename,
            type: fileType,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: getFileUrl(req, filename)
          });
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }
  }

  // Sort by creation date (newest first)
  files.sort((a, b) => new Date(b.created) - new Date(a.created));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedFiles = files.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      files: paginatedFiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(files.length / parseInt(limit)),
        totalFiles: files.length,
        hasNext: endIndex < files.length,
        hasPrev: startIndex > 0
      }
    }
  });
});

module.exports = {
  uploadAvatar,
  uploadProductImage,
  uploadProductImages,
  uploadCategoryImage,
  deleteFile,
  getFileInfo,
  listFiles
};
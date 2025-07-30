const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Cart management
router.post('/cart/add', asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  await req.user.addToCart(productId, quantity);
  
  res.json({
    success: true,
    message: 'Item added to cart',
    data: { cart: req.user.cart }
  });
}));

router.delete('/cart/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  await req.user.removeFromCart(parseInt(productId));
  
  res.json({
    success: true,
    message: 'Item removed from cart',
    data: { cart: req.user.cart }
  });
}));

router.get('/cart', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.productId');
  
  res.json({
    success: true,
    data: { cart: user.cart }
  });
}));

// Wishlist management
router.post('/wishlist/toggle', asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  await req.user.toggleWishlist(productId);
  
  res.json({
    success: true,
    message: 'Wishlist updated',
    data: { wishlist: req.user.wishlist }
  });
}));

router.get('/wishlist', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist.productId');
  
  res.json({
    success: true,
    data: { wishlist: user.wishlist }
  });
}));

// Admin routes for user management
router.get('/', 
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      select: '-password'
    };

    const users = await User.paginate(query, options);

    res.json({
      success: true,
      data: users
    });
  })
);

router.get('/:id',
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

router.put('/:id/role',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  })
);

router.put('/:id/status',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  })
);

module.exports = router;
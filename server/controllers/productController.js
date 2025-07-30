const Product = require('../models/mysql/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all products with filtering, searching, and pagination
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    inStock
  } = req.query;

  const filters = {
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    sortBy,
    sortOrder: sortOrder.toUpperCase()
  };

  if (search) filters.search = search;
  if (category && category !== 'all') filters.category = category;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  if (inStock === 'true') filters.inStock = true;

  const products = await Product.findAll(filters);

  // Get total count for pagination (without limit/offset)
  const totalFilters = { ...filters };
  delete totalFilters.limit;
  delete totalFilters.offset;
  const allProducts = await Product.findAll(totalFilters);
  const totalProducts = allProducts.length;

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        hasNext: parseInt(page) < Math.ceil(totalProducts / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

// Get single product by ID
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Get product reviews
  const reviews = await product.getReviews();

  res.json({
    success: true,
    data: {
      product: {
        ...product,
        reviews
      }
    }
  });
});

// Create new product (Admin only)
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  // Add created by info
  productData.created_by = req.user._id;
  
  const product = await Product.create(productData);
  
  // Emit real-time update
  req.app.get('io').emit('product:created', {
    product,
    createdBy: req.user.name
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

// Update product (Admin only)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const product = await Product.update(id, updateData);

  // Emit real-time update
  req.app.get('io').emit('product:updated', {
    product,
    updatedBy: req.user.name
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

// Delete product (Admin only)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const deleted = await Product.delete(id);
  
  if (!deleted) {
    return res.status(400).json({
      success: false,
      message: 'Failed to delete product'
    });
  }

  // Emit real-time update
  req.app.get('io').emit('product:deleted', {
    productId: id,
    deletedBy: req.user.name
  });

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Update product stock (Admin only)
const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, changeType = 'adjustment', reason = '' } = req.body;

  const product = await Product.updateStock(
    id, 
    parseInt(quantity), 
    changeType, 
    reason, 
    req.user._id
  );

  // Emit real-time update
  req.app.get('io').emit('product:stock_updated', {
    product,
    change: quantity,
    updatedBy: req.user.name
  });

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: { product }
  });
});

// Get product categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.getCategories();

  res.json({
    success: true,
    data: { categories }
  });
});

// Get featured products
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;
  
  const products = await Product.getFeatured(parseInt(limit));

  res.json({
    success: true,
    data: { products }
  });
});

// Get top rated products
const getTopRatedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const products = await Product.getTopRated(parseInt(limit));

  res.json({
    success: true,
    data: { products }
  });
});

// Add product review
const addProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment = '' } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  await product.addReview(req.user._id, req.user.name, rating, comment);

  // Get updated product with new rating
  const updatedProduct = await Product.findById(id);

  // Emit real-time update
  req.app.get('io').emit('product:review_added', {
    productId: id,
    review: {
      userId: req.user._id,
      userName: req.user.name,
      rating,
      comment,
      createdAt: new Date()
    },
    newRating: updatedProduct.rating
  });

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: {
      product: updatedProduct
    }
  });
});

// Get stock report (Admin only)
const getStockReport = asyncHandler(async (req, res) => {
  const report = await Product.getStockReport();

  res.json({
    success: true,
    data: { report }
  });
});

module.exports = {
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
};
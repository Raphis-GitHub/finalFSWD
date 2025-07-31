const jsonDataService = require('../services/jsonDataService');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await jsonDataService.getProducts();
    
    // Simple filtering by category if provided
    const { category, search } = req.query;
    let filteredProducts = products;
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: { products: filteredProducts }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await jsonDataService.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product'
    });
  }
};

// Create product (admin only)
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await jsonDataService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await jsonDataService.updateProduct(req.params.id, productData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
  try {
    await jsonDataService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete product'
    });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const products = await jsonDataService.getProducts();
    const categories = [...new Set(products.map(product => product.category))];
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
const Order = require('../models/mysql/Order');
const Product = require('../models/mysql/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Create new order
const createOrder = asyncHandler(async (req, res) => {
  const { items, shipping_address, payment_method, order_notes } = req.body;
  
  // Validate items and calculate total
  let total_amount = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product_id);
    
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${item.product_id} not found`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      });
    }

    const itemTotal = product.price * item.quantity;
    total_amount += itemTotal;

    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      price: product.price
    });
  }

  // Create order
  const orderData = {
    user_id: req.user._id.toString(),
    items: validatedItems,
    total_amount,
    shipping_address,
    payment_method,
    order_notes
  };

  const order = await Order.create(orderData);

  // Clear user's cart
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();

  // Emit real-time update
  req.app.get('io').emit('order:created', {
    order,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

// Get user's orders
const getUserOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const filters = {
    userId: req.user._id.toString(),
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    sortBy,
    sortOrder: sortOrder.toUpperCase()
  };

  if (status) filters.status = status;

  const orders = await Order.findAll(filters);

  // Get order items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await order.getItems();
      return { ...order, items };
    })
  );

  // Get total count for pagination
  const totalFilters = { ...filters };
  delete totalFilters.limit;
  delete totalFilters.offset;
  const allOrders = await Order.findAll(totalFilters);
  const totalOrders = allOrders.length;

  res.json({
    success: true,
    data: {
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

// Get single order
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const order = await Order.findById(id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns the order or is admin
  if (order.user_id !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Get order items
  const items = await order.getItems();

  res.json({
    success: true,
    data: {
      order: { ...order, items }
    }
  });
});

// Update order status (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, tracking_number } = req.body;

  const order = await Order.updateStatus(id, status, tracking_number);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Emit real-time update
  req.app.get('io').emit('order:status_updated', {
    orderId: id,
    status,
    tracking_number,
    updatedBy: req.user.name
  });

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = '' } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns the order
  if (order.user_id !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const cancelledOrder = await order.cancel(reason);

  // Emit real-time update
  req.app.get('io').emit('order:cancelled', {
    orderId: id,
    reason,
    cancelledBy: req.user.name
  });

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order: cancelledOrder }
  });
});

// Get all orders (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    userId,
    startDate,
    endDate,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const filters = {
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    sortBy,
    sortOrder: sortOrder.toUpperCase()
  };

  if (status) filters.status = status;
  if (userId) filters.userId = userId;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const orders = await Order.findAll(filters);

  // Get order items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await order.getItems();
      return { ...order, items };
    })
  );

  // Get total count for pagination
  const totalFilters = { ...filters };
  delete totalFilters.limit;
  delete totalFilters.offset;
  const allOrders = await Order.findAll(totalFilters);
  const totalOrders = allOrders.length;

  res.json({
    success: true,
    data: {
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

// Get order statistics (Admin only)
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const stats = await Order.getOrderStats(filters);

  res.json({
    success: true,
    data: { stats }
  });
});

// Get revenue analytics (Admin only)
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month', limit = 12 } = req.query;
  
  const revenue = await Order.getRevenueByPeriod(period, parseInt(limit));

  res.json({
    success: true,
    data: { revenue }
  });
});

// Get top customers (Admin only)
const getTopCustomers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const customers = await Order.getTopCustomers(parseInt(limit));

  // Get user details for each customer
  const customersWithDetails = await Promise.all(
    customers.map(async (customer) => {
      const user = await User.findById(customer.user_id).select('name email avatar');
      return {
        ...customer,
        user
      };
    })
  );

  res.json({
    success: true,
    data: { customers: customersWithDetails }
  });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  getRevenueAnalytics,
  getTopCustomers
};
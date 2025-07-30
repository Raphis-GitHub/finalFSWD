const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Order = require('../models/mysql/Order');
const Product = require('../models/mysql/Product');
const User = require('../models/User');

const router = express.Router();

// All analytics routes require admin/manager role
router.use(authenticate);
router.use(authorize('admin', 'manager'));

// Dashboard overview
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Get basic stats
  const orderStats = await Order.getOrderStats({ startDate, endDate });
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalProducts = (await Product.findAll()).length;
  const stockReport = await Product.getStockReport();
  
  // Calculate growth rates (mock data for demo)
  const growthRates = {
    revenue: 15.5,
    orders: 12.3,
    users: 8.7,
    products: 5.2
  };

  res.json({
    success: true,
    data: {
      overview: {
        totalRevenue: orderStats.total_revenue || 0,
        totalOrders: orderStats.total_orders || 0,
        totalUsers,
        totalProducts,
        averageOrderValue: orderStats.average_order_value || 0
      },
      orderBreakdown: {
        pending: orderStats.pending_orders || 0,
        processing: orderStats.processing_orders || 0,
        shipped: orderStats.shipped_orders || 0,
        delivered: orderStats.delivered_orders || 0,
        cancelled: orderStats.cancelled_orders || 0
      },
      inventory: {
        totalCategories: stockReport.length,
        lowStockProducts: stockReport.reduce((sum, cat) => sum + cat.low_stock, 0),
        outOfStockProducts: stockReport.reduce((sum, cat) => sum + cat.out_of_stock, 0)
      },
      growth: growthRates
    }
  });
}));

// Revenue analytics
router.get('/revenue', asyncHandler(async (req, res) => {
  const { period = 'month', limit = 12 } = req.query;
  
  const revenueData = await Order.getRevenueByPeriod(period, parseInt(limit));
  
  res.json({
    success: true,
    data: {
      revenue: revenueData,
      period,
      totalPeriods: revenueData.length
    }
  });
}));

// Product analytics
router.get('/products', asyncHandler(async (req, res) => {
  const topRated = await Product.getTopRated(10);
  const stockReport = await Product.getStockReport();
  const categories = await Product.getCategories();
  
  // Mock product views and sales data
  const productPerformance = topRated.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    rating: product.rating,
    stock: product.stock,
    views: Math.floor(Math.random() * 1000) + 100,
    sales: Math.floor(Math.random() * 50) + 10,
    revenue: product.price * (Math.floor(Math.random() * 50) + 10)
  }));

  res.json({
    success: true,
    data: {
      topProducts: productPerformance,
      stockReport,
      categories,
      totalProducts: (await Product.findAll()).length
    }
  });
}));

// Customer analytics
router.get('/customers', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const topCustomers = await Order.getTopCustomers(parseInt(limit));
  const userStats = await User.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Mock customer segments
  const customerSegments = [
    { segment: 'New Customers', count: 145, percentage: 35 },
    { segment: 'Returning Customers', count: 189, percentage: 45 },
    { segment: 'VIP Customers', count: 83, percentage: 20 }
  ];

  res.json({
    success: true,
    data: {
      topCustomers,
      usersByRole: userStats,
      segments: customerSegments,
      totalActiveUsers: await User.countDocuments({ isActive: true })
    }
  });
}));

// Sales trends
router.get('/trends', asyncHandler(async (req, res) => {
  const { period = 'day', days = 30 } = req.query;
  
  // Mock trend data
  const trends = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  for (let i = 0; i < parseInt(days); i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 1000) + 200,
      orders: Math.floor(Math.random() * 50) + 10,
      visitors: Math.floor(Math.random() * 500) + 100,
      conversion: (Math.random() * 5 + 2).toFixed(2)
    });
  }

  res.json({
    success: true,
    data: {
      trends,
      period,
      totalDays: parseInt(days)
    }
  });
}));

// Real-time analytics
router.get('/realtime', asyncHandler(async (req, res) => {
  // Mock real-time data
  const realTimeData = {
    activeUsers: Math.floor(Math.random() * 50) + 20,
    onlineAdmins: Math.floor(Math.random() * 5) + 1,
    todaySales: Math.floor(Math.random() * 5000) + 1000,
    todayOrders: Math.floor(Math.random() * 30) + 5,
    pendingOrders: Math.floor(Math.random() * 15) + 2,
    lowStockAlerts: Math.floor(Math.random() * 8) + 1,
    recentActivity: [
      {
        type: 'order_placed',
        description: 'New order #1234 placed',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        type: 'product_updated',
        description: 'Product "Wireless Headphones" updated',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        type: 'user_registered',
        description: 'New user registered: john@example.com',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      }
    ].sort((a, b) => b.timestamp - a.timestamp)
  };

  res.json({
    success: true,
    data: realTimeData
  });
}));

// Export data
router.get('/export', asyncHandler(async (req, res) => {
  const { type, format = 'json', startDate, endDate } = req.query;
  
  let data = {};
  
  switch (type) {
    case 'orders':
      data = await Order.findAll({ startDate, endDate });
      break;
    case 'products':
      data = await Product.findAll();
      break;
    case 'users':
      data = await User.find({ isActive: true }).select('-password');
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid export type'
      });
  }

  if (format === 'csv') {
    // Convert to CSV format (simplified)
    const csv = convertToCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
    return res.send(csv);
  }

  res.json({
    success: true,
    data: {
      type,
      format,
      recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
      exportedAt: new Date().toISOString(),
      records: data
    }
  });
}));

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

module.exports = router;
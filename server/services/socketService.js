const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const socketHandler = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userId})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);
    
    // Join admin/manager users to admin room
    if (['admin', 'manager'].includes(socket.userRole)) {
      socket.join('admin');
    }

    // Join all users to general updates room
    socket.join('general');

    // Handle user status updates
    socket.on('user:status', (status) => {
      socket.broadcast.emit('user:status_changed', {
        userId: socket.userId,
        userName: socket.userName,
        status,
        timestamp: new Date()
      });
    });

    // Handle cart updates
    socket.on('cart:update', (cartData) => {
      // Broadcast to user's other sessions
      socket.to(`user:${socket.userId}`).emit('cart:updated', {
        cart: cartData,
        updatedBy: socket.userName,
        timestamp: new Date()
      });
    });

    // Handle wishlist updates
    socket.on('wishlist:update', (wishlistData) => {
      socket.to(`user:${socket.userId}`).emit('wishlist:updated', {
        wishlist: wishlistData,
        updatedBy: socket.userName,
        timestamp: new Date()
      });
    });

    // Handle product views (for analytics)
    socket.on('product:view', (productData) => {
      // Emit to admin for real-time analytics
      io.to('admin').emit('analytics:product_view', {
        productId: productData.productId,
        productName: productData.productName,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
    });

    // Handle order status tracking
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`User ${socket.userName} is tracking order ${orderId}`);
    });

    // Handle admin notifications
    if (['admin', 'manager'].includes(socket.userRole)) {
      socket.on('admin:broadcast', (message) => {
        io.to('general').emit('admin:notification', {
          message,
          from: socket.userName,
          timestamp: new Date()
        });
      });

      socket.on('admin:user_message', ({ userId, message }) => {
        io.to(`user:${userId}`).emit('admin:message', {
          message,
          from: socket.userName,
          timestamp: new Date()
        });
      });
    }

    // Handle chat/support messages
    socket.on('support:message', (messageData) => {
      const supportRoom = `support:${socket.userId}`;
      socket.join(supportRoom);
      
      // Send to admin/support team
      io.to('admin').emit('support:new_message', {
        userId: socket.userId,
        userName: socket.userName,
        message: messageData.message,
        room: supportRoom,
        timestamp: new Date()
      });
    });

    socket.on('support:reply', ({ userId, message }) => {
      if (['admin', 'manager'].includes(socket.userRole)) {
        io.to(`support:${userId}`).emit('support:reply', {
          message,
          from: socket.userName,
          timestamp: new Date()
        });
      }
    });

    // Handle inventory alerts
    socket.on('inventory:low_stock_alert', (productData) => {
      if (['admin', 'manager'].includes(socket.userRole)) {
        io.to('admin').emit('inventory:low_stock', {
          productId: productData.productId,
          productName: productData.productName,
          currentStock: productData.stock,
          threshold: productData.threshold || 10,
          timestamp: new Date()
        });
      }
    });

    // Handle promotion broadcasts
    socket.on('promotion:broadcast', (promotionData) => {
      if (['admin', 'manager'].includes(socket.userRole)) {
        io.to('general').emit('promotion:new', {
          title: promotionData.title,
          description: promotionData.description,
          discountPercentage: promotionData.discountPercentage,
          validUntil: promotionData.validUntil,
          timestamp: new Date()
        });
      }
    });

    // Handle user typing indicators (for support chat)
    socket.on('support:typing', () => {
      socket.to('admin').emit('support:user_typing', {
        userId: socket.userId,
        userName: socket.userName
      });
    });

    socket.on('support:stop_typing', () => {
      socket.to('admin').emit('support:user_stop_typing', {
        userId: socket.userId,
        userName: socket.userName
      });
    });

    // Handle admin typing in support
    socket.on('admin:typing', ({ userId }) => {
      if (['admin', 'manager'].includes(socket.userRole)) {
        socket.to(`support:${userId}`).emit('admin:typing', {
          adminName: socket.userName
        });
      }
    });

    socket.on('admin:stop_typing', ({ userId }) => {
      if (['admin', 'manager'].includes(socket.userRole)) {
        socket.to(`support:${userId}`).emit('admin:stop_typing', {
          adminName: socket.userName
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userName} (${socket.userId}) - Reason: ${reason}`);
      
      // Notify other users in admin room if admin disconnects
      if (['admin', 'manager'].includes(socket.userRole)) {
        socket.to('admin').emit('admin:user_offline', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });
      }

      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
    });

    // Send welcome message
    socket.emit('connection:success', {
      message: 'Connected to ShopHub real-time service',
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      timestamp: new Date()
    });

    // Notify admins of new user connection
    if (socket.userRole === 'customer') {
      io.to('admin').emit('user:connected', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
    }
  });

  // Helper functions for emitting events from other parts of the application
  const socketHelpers = {
    // Emit to specific user
    emitToUser: (userId, event, data) => {
      io.to(`user:${userId}`).emit(event, data);
    },

    // Emit to all admins
    emitToAdmins: (event, data) => {
      io.to('admin').emit(event, data);
    },

    // Emit to all connected users
    emitToAll: (event, data) => {
      io.to('general').emit(event, data);
    },

    // Emit to specific order tracking
    emitToOrder: (orderId, event, data) => {
      io.to(`order:${orderId}`).emit(event, data);
    },

    // Get connected users count
    getConnectedUsersCount: async () => {
      const sockets = await io.fetchSockets();
      return sockets.length;
    },

    // Get connected admins count
    getConnectedAdminsCount: async () => {
      const adminSockets = await io.in('admin').fetchSockets();
      return adminSockets.length;
    }
  };

  // Attach helpers to io instance for use in other modules
  io.helpers = socketHelpers;

  return io;
};

module.exports = socketHandler;
// WebSocket service for real-time updates
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to ShopHub real-time service');
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from real-time service:', reason);
      this.connected = false;
    });

    this.socket.on('connection:success', (data) => {
      console.log('Real-time connection established:', data);
    });

    // Set up default event listeners
    this.setupDefaultListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  setupDefaultListeners() {
    // Product updates
    this.socket.on('product:created', (data) => {
      this.emit('productCreated', data);
    });

    this.socket.on('product:updated', (data) => {
      this.emit('productUpdated', data);
    });

    this.socket.on('product:deleted', (data) => {
      this.emit('productDeleted', data);
    });

    this.socket.on('product:stock_updated', (data) => {
      this.emit('stockUpdated', data);
    });

    // Order updates
    this.socket.on('order:created', (data) => {
      this.emit('orderCreated', data);
    });

    this.socket.on('order:status_updated', (data) => {
      this.emit('orderStatusUpdated', data);
    });

    this.socket.on('order:cancelled', (data) => {
      this.emit('orderCancelled', data);
    });

    // Cart and wishlist updates
    this.socket.on('cart:updated', (data) => {
      this.emit('cartUpdated', data);
    });

    this.socket.on('wishlist:updated', (data) => {
      this.emit('wishlistUpdated', data);
    });

    // Admin notifications
    this.socket.on('admin:notification', (data) => {
      this.emit('adminNotification', data);
    });

    this.socket.on('admin:message', (data) => {
      this.emit('adminMessage', data);
    });

    // Promotions
    this.socket.on('promotion:new', (data) => {
      this.emit('newPromotion', data);
    });

    // Support messages
    this.socket.on('support:reply', (data) => {
      this.emit('supportReply', data);
    });

    this.socket.on('support:new_message', (data) => {
      this.emit('newSupportMessage', data);
    });

    // Inventory alerts
    this.socket.on('inventory:low_stock', (data) => {
      this.emit('lowStockAlert', data);
    });

    // User status updates
    this.socket.on('user:status_changed', (data) => {
      this.emit('userStatusChanged', data);
    });

    this.socket.on('user:connected', (data) => {
      this.emit('userConnected', data);
    });

    this.socket.on('user:offline', (data) => {
      this.emit('userOffline', data);
    });
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  // Send events to server
  sendEvent(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  // Specific methods for common operations
  updateUserStatus(status) {
    this.sendEvent('user:status', status);
  }

  updateCart(cartData) {
    this.sendEvent('cart:update', cartData);
  }

  updateWishlist(wishlistData) {
    this.sendEvent('wishlist:update', wishlistData);
  }

  trackOrder(orderId) {
    this.sendEvent('order:track', orderId);
  }

  viewProduct(productData) {
    this.sendEvent('product:view', productData);
  }

  sendSupportMessage(message) {
    this.sendEvent('support:message', { message });
  }

  broadcastToUsers(message) {
    this.sendEvent('admin:broadcast', message);
  }

  sendUserMessage(userId, message) {
    this.sendEvent('admin:user_message', { userId, message });
  }

  startTyping() {
    this.sendEvent('support:typing');
  }

  stopTyping() {
    this.sendEvent('support:stop_typing');
  }

  adminStartTyping(userId) {
    this.sendEvent('admin:typing', { userId });
  }

  adminStopTyping(userId) {
    this.sendEvent('admin:stop_typing', { userId });
  }

  broadcastPromotion(promotionData) {
    this.sendEvent('promotion:broadcast', promotionData);
  }

  sendLowStockAlert(productData) {
    this.sendEvent('inventory:low_stock_alert', productData);
  }

  isConnected() {
    return this.connected;
  }

  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
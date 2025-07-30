// API service layer for ShopHub application
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password, rememberMe = false) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (data.success) {
      this.token = data.data.accessToken;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
    }

    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.success) {
      this.token = data.data.accessToken;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedProducts(limit = 6) {
    return this.request(`/products/featured?limit=${limit}`);
  }

  async getCategories() {
    return this.request('/products/categories');
  }

  async addProductReview(productId, rating, comment) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // Orders
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/my-orders?${queryString}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id, reason) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Admin - Orders
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  async updateOrderStatus(id, status, trackingNumber) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, tracking_number: trackingNumber }),
    });
  }

  // Cart & Wishlist
  async addToCart(productId, quantity = 1) {
    return this.request('/users/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId) {
    return this.request(`/users/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async getCart() {
    return this.request('/users/cart');
  }

  async toggleWishlist(productId) {
    return this.request('/users/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async getWishlist() {
    return this.request('/users/wishlist');
  }

  // File Upload
  async uploadFile(file, type = 'productImage') {
    const formData = new FormData();
    formData.append(type, file);

    return this.request(`/upload/${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });
  }

  // Analytics (Admin)
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getRevenueAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/revenue?${queryString}`);
  }

  async getProductAnalytics() {
    return this.request('/analytics/products');
  }

  async getCustomerAnalytics() {
    return this.request('/analytics/customers');
  }

  // Payments
  async createPaymentIntent(amount, currency = 'USD', paymentMethod) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, paymentMethod }),
    });
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });
  }

  // Refresh token
  async refreshToken() {
    try {
      const data = await this.request('/auth/refresh-token', {
        method: 'POST',
      });

      if (data.success) {
        this.token = data.data.accessToken;
        localStorage.setItem('authToken', this.token);
      }

      return data;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Add response interceptor for token refresh
const originalRequest = apiService.request.bind(apiService);
apiService.request = async function(endpoint, options = {}) {
  try {
    return await originalRequest(endpoint, options);
  } catch (error) {
    // If token expired, try to refresh
    if (error.message.includes('token') && error.message.includes('expired')) {
      try {
        await this.refreshToken();
        // Retry original request with new token
        return await originalRequest(endpoint, options);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        throw refreshError;
      }
    }
    throw error;
  }
};

export default apiService;
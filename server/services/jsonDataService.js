const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

class JsonDataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  async readFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  async writeFile(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  // User operations
  async getUsers() {
    return await this.readFile('users.json');
  }

  async getUserById(id) {
    const users = await this.getUsers();
    return users.find(user => user.id === parseInt(id));
  }

  async getUserByEmail(email) {
    const users = await this.getUsers();
    return users.find(user => user.email === email);
  }

  async createUser(userData) {
    const users = await this.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userData,
      password: hashedPassword,
      role: userData.role || 'customer',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.writeFile('users.json', users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateUser(id, userData) {
    const users = await this.getUsers();
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };

    await this.writeFile('users.json', users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  async verifyPassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Product operations
  async getProducts() {
    return await this.readFile('products.json');
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(product => product.id === parseInt(id));
  }

  async createProduct(productData) {
    const products = await this.getProducts();
    
    const newProduct = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      ...productData,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    await this.writeFile('products.json', products);
    return newProduct;
  }

  async updateProduct(id, productData) {
    const products = await this.getProducts();
    const productIndex = products.findIndex(product => product.id === parseInt(id));
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    products[productIndex] = {
      ...products[productIndex],
      ...productData,
      updatedAt: new Date().toISOString()
    };

    await this.writeFile('products.json', products);
    return products[productIndex];
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const productIndex = products.findIndex(product => product.id === parseInt(id));
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    const deletedProduct = products.splice(productIndex, 1)[0];
    await this.writeFile('products.json', products);
    return deletedProduct;
  }

  // Order operations
  async getOrders() {
    return await this.readFile('orders.json');
  }

  async getOrderById(id) {
    const orders = await this.getOrders();
    return orders.find(order => order.id === parseInt(id));
  }

  async getOrdersByUserId(userId) {
    const orders = await this.getOrders();
    return orders.filter(order => order.userId === parseInt(userId));
  }

  async createOrder(orderData) {
    const orders = await this.getOrders();
    
    const newOrder = {
      id: Math.max(...orders.map(o => o.id), 0) + 1,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    await this.writeFile('orders.json', orders);
    return newOrder;
  }

  async updateOrder(id, orderData) {
    const orders = await this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === parseInt(id));
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...orderData,
      updatedAt: new Date().toISOString()
    };

    await this.writeFile('orders.json', orders);
    return orders[orderIndex];
  }
}

module.exports = new JsonDataService();
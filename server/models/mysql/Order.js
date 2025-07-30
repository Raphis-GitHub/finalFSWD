const { getPool } = require('../../config/database');
const Product = require('./Product');

class Order {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.total_amount = data.total_amount;
    this.status = data.status;
    this.shipping_address = data.shipping_address;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status;
    this.order_notes = data.order_notes;
    this.tracking_number = data.tracking_number;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.paymentStatus) {
      query += ' AND payment_status = ?';
      params.push(filters.paymentStatus);
    }

    if (filters.startDate) {
      query += ' AND created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows.map(row => new Order(row));
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows.length > 0 ? new Order(rows[0]) : null;
  }

  static async create(orderData) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        user_id,
        items,
        shipping_address,
        payment_method,
        order_notes = '',
        total_amount
      } = orderData;

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, order_notes, status, payment_status)
         VALUES (?, ?, ?, ?, ?, 'pending', 'pending')`,
        [user_id, total_amount, shipping_address, payment_method, order_notes]
      );

      const orderId = orderResult.insertId;

      // Add order items and update stock
      for (const item of items) {
        // Add order item
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, item.quantity, item.price]
        );

        // Update product stock
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );

        // Check if stock update was successful
        const [stockCheck] = await connection.execute(
          'SELECT stock FROM products WHERE id = ?',
          [item.product_id]
        );

        if (stockCheck.length === 0) {
          throw new Error(`Product ${item.product_name} not found`);
        }

        // Log inventory change
        await connection.execute(
          `INSERT INTO inventory_logs 
           (product_id, change_type, quantity_change, previous_stock, new_stock, reason, created_by)
           VALUES (?, 'stock_out', ?, ?, ?, ?, ?)`,
          [
            item.product_id,
            -item.quantity,
            stockCheck[0].stock + item.quantity,
            stockCheck[0].stock,
            `Order #${orderId}`,
            user_id
          ]
        );
      }

      await connection.commit();
      return await Order.findById(orderId);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, status, trackingNumber = null) {
    const pool = getPool();
    let query = 'UPDATE orders SET status = ?';
    let params = [status];

    if (trackingNumber) {
      query += ', tracking_number = ?';
      params.push(trackingNumber);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
    return await Order.findById(id);
  }

  static async updatePaymentStatus(id, paymentStatus) {
    const pool = getPool();
    await pool.execute(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [paymentStatus, id]
    );
    return await Order.findById(id);
  }

  async getItems() {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id',
      [this.id]
    );
    return rows;
  }

  async cancel(reason = '') {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Check if order can be cancelled
      if (['shipped', 'delivered', 'cancelled'].includes(this.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }
      
      // Get order items
      const items = await this.getItems();
      
      // Restore stock for each item
      for (const item of items) {
        await connection.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
        
        // Log inventory change
        const [stockCheck] = await connection.execute(
          'SELECT stock FROM products WHERE id = ?',
          [item.product_id]
        );
        
        await connection.execute(
          `INSERT INTO inventory_logs 
           (product_id, change_type, quantity_change, previous_stock, new_stock, reason, created_by)
           VALUES (?, 'stock_in', ?, ?, ?, ?, ?)`,
          [
            item.product_id,
            item.quantity,
            stockCheck[0].stock - item.quantity,
            stockCheck[0].stock,
            `Order #${this.id} cancelled: ${reason}`,
            this.user_id
          ]
        );
      }
      
      // Update order status
      await connection.execute(
        'UPDATE orders SET status = ?, order_notes = CONCAT(COALESCE(order_notes, ""), ?, ?) WHERE id = ?',
        ['cancelled', '\nCancellation reason: ', reason, this.id]
      );
      
      await connection.commit();
      return await Order.findById(this.id);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getOrderStats(filters = {}) {
    const pool = getPool();
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders ${whereClause}
    `, params);

    return stats[0];
  }

  static async getRevenueByPeriod(period = 'month', limit = 12) {
    const pool = getPool();
    let dateFormat;
    
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }

    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as orders_count,
        SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as revenue
      FROM orders 
      WHERE payment_status = 'completed'
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY period DESC
      LIMIT ?
    `, [dateFormat, dateFormat, limit]);

    return rows;
  }

  static async getTopCustomers(limit = 10) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        user_id,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent,
        AVG(total_amount) as avg_order_value,
        MAX(created_at) as last_order_date
      FROM orders 
      WHERE payment_status = 'completed'
      GROUP BY user_id
      ORDER BY total_spent DESC
      LIMIT ?
    `, [limit]);

    return rows;
  }
}

module.exports = Order;
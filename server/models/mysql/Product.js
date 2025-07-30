const { getPool } = require('../../config/database');

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.stock = data.stock;
    this.image_url = data.image_url;
    this.rating = data.rating;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.minPrice) {
      query += ' AND price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ' AND price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.inStock) {
      query += ' AND stock > 0';
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
    return rows.map(row => new Product(row));
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows.length > 0 ? new Product(rows[0]) : null;
  }

  static async create(productData) {
    const pool = getPool();
    const {
      name,
      description,
      price,
      category,
      stock,
      image_url,
      rating = 0.0
    } = productData;

    const [result] = await pool.execute(
      `INSERT INTO products (name, description, price, category, stock, image_url, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, stock, image_url, rating]
    );

    return await Product.findById(result.insertId);
  }

  static async update(id, updateData) {
    const pool = getPool();
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    
    await pool.execute(query, values);
    return await Product.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async updateStock(id, quantity, changeType = 'adjustment', reason = '', createdBy = '') {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current product
      const [productRows] = await connection.execute(
        'SELECT stock FROM products WHERE id = ? FOR UPDATE',
        [id]
      );
      
      if (productRows.length === 0) {
        throw new Error('Product not found');
      }
      
      const currentStock = productRows[0].stock;
      const newStock = currentStock + quantity;
      
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }
      
      // Update product stock
      await connection.execute(
        'UPDATE products SET stock = ? WHERE id = ?',
        [newStock, id]
      );
      
      // Log inventory change
      await connection.execute(
        `INSERT INTO inventory_logs 
         (product_id, change_type, quantity_change, previous_stock, new_stock, reason, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, changeType, quantity, currentStock, newStock, reason, createdBy]
      );
      
      await connection.commit();
      return await Product.findById(id);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getCategories() {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT DISTINCT category, COUNT(*) as product_count FROM products GROUP BY category ORDER BY category'
    );
    return rows;
  }

  static async getTopRated(limit = 10) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE rating > 0 ORDER BY rating DESC, created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(row => new Product(row));
  }

  static async getFeatured(limit = 6) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE stock > 0 ORDER BY rating DESC, created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(row => new Product(row));
  }

  static async getStockReport() {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as total_products,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as low_stock,
        AVG(stock) as avg_stock
      FROM products 
      GROUP BY category
      ORDER BY category
    `);
    return rows;
  }

  async getReviews() {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT pr.*, u.name as user_name 
       FROM product_reviews pr 
       LEFT JOIN users u ON pr.user_id = u.id 
       WHERE pr.product_id = ? 
       ORDER BY pr.created_at DESC`,
      [this.id]
    );
    return rows;
  }

  async addReview(userId, userName, rating, comment = '') {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Add review
      await connection.execute(
        `INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [this.id, userId, userName, rating, comment]
      );
      
      // Update product rating
      const [avgResult] = await connection.execute(
        'SELECT AVG(rating) as avg_rating FROM product_reviews WHERE product_id = ?',
        [this.id]
      );
      
      const newRating = parseFloat(avgResult[0].avg_rating).toFixed(2);
      
      await connection.execute(
        'UPDATE products SET rating = ? WHERE id = ?',
        [newRating, this.id]
      );
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Product;
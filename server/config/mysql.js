const mysql = require('mysql2/promise');

let pool;

const connectMySQL = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'shophub_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected successfully');
    connection.release();

    // Create tables if they don't exist
    await createTables();

  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Products table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        image_url TEXT,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_price (price),
        INDEX idx_stock (stock)
      )
    `);

    // Orders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        order_notes TEXT,
        tracking_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // Order items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      )
    `);

    // Product reviews table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_user_id (user_id),
        INDEX idx_rating (rating)
      )
    `);

    // Inventory tracking table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        change_type ENUM('stock_in', 'stock_out', 'adjustment') NOT NULL,
        quantity_change INT NOT NULL,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        reason VARCHAR(255),
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_created_at (created_at)
      )
    `);

    // Categories table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ MySQL tables created/verified successfully');

  } catch (error) {
    console.error('❌ Error creating MySQL tables:', error.message);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('MySQL pool not initialized. Call connectMySQL first.');
  }
  return pool;
};

module.exports = { connectMySQL, getPool };
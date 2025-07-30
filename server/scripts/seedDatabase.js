require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/mysql/Product');
const { connectMySQL } = require('../config/mysql');

// Sample data
const sampleUsers = [
  {
    name: 'John Customer',
    email: 'customer@demo.com',
    password: '123456',
    role: 'customer',
    phone: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    isEmailVerified: true
  },
  {
    name: 'Jane Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0456',
    address: {
      street: '456 Admin Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    isEmailVerified: true
  },
  {
    name: 'Mike Manager',
    email: 'manager@demo.com',
    password: 'manager123',
    role: 'manager',
    phone: '+1-555-0789',
    address: {
      street: '789 Manager Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    isEmailVerified: true
  }
];

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
    price: 99.99,
    category: 'Electronics',
    stock: 15,
    image_url: 'https://via.placeholder.com/300x300?text=Wireless+Headphones',
    rating: 4.5
  },
  {
    name: 'Smart Watch',
    description: 'Advanced smartwatch with health tracking features, GPS, and long battery life. Stay connected and monitor your fitness.',
    price: 299.99,
    category: 'Electronics',
    stock: 8,
    image_url: 'https://via.placeholder.com/300x300?text=Smart+Watch',
    rating: 4.8
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with built-in grinder and thermal carafe. Brew the perfect cup every time.',
    price: 159.99,
    category: 'Home',
    stock: 12,
    image_url: 'https://via.placeholder.com/300x300?text=Coffee+Maker',
    rating: 4.3
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes with advanced cushioning and breathable mesh upper. Perfect for daily runs and workouts.',
    price: 129.99,
    category: 'Sports',
    stock: 25,
    image_url: 'https://via.placeholder.com/300x300?text=Running+Shoes',
    rating: 4.6
  },
  {
    name: 'LED Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness levels and color temperature. Eye-friendly lighting for work and study.',
    price: 45.99,
    category: 'Home',
    stock: 30,
    image_url: 'https://via.placeholder.com/300x300?text=LED+Desk+Lamp',
    rating: 4.2
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with premium sound quality and waterproof design. Perfect for outdoor adventures.',
    price: 79.99,
    category: 'Electronics',
    stock: 18,
    image_url: 'https://via.placeholder.com/300x300?text=Bluetooth+Speaker',
    rating: 4.4
  },
  {
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RTX graphics card and fast SSD storage. Dominate your favorite games.',
    price: 1299.99,
    category: 'Electronics',
    stock: 5,
    image_url: 'https://via.placeholder.com/300x300?text=Gaming+Laptop',
    rating: 4.7
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with extra cushioning for comfortable practice. Eco-friendly materials and perfect grip.',
    price: 39.99,
    category: 'Sports',
    stock: 40,
    image_url: 'https://via.placeholder.com/300x300?text=Yoga+Mat',
    rating: 4.3
  },
  {
    name: 'Kitchen Knife Set',
    description: 'Professional chef knife set with wooden block. Sharp, durable blades for all your cooking needs.',
    price: 89.99,
    category: 'Home',
    stock: 20,
    image_url: 'https://via.placeholder.com/300x300?text=Kitchen+Knife+Set',
    rating: 4.6
  },
  {
    name: 'Tablet 10-inch',
    description: '10-inch tablet with high-resolution display and all-day battery life. Perfect for entertainment and productivity.',
    price: 349.99,
    category: 'Electronics',
    stock: 15,
    image_url: 'https://via.placeholder.com/300x300?text=Tablet+10+inch',
    rating: 4.4
  },
  {
    name: 'Basketball',
    description: 'Official size basketball with premium leather construction. Perfect for indoor and outdoor play.',
    price: 29.99,
    category: 'Sports',
    stock: 35,
    image_url: 'https://via.placeholder.com/300x300?text=Basketball',
    rating: 4.2
  },
  {
    name: 'Throw Pillows Set',
    description: 'Set of 4 decorative throw pillows with soft fabric covers. Add comfort and style to your living space.',
    price: 49.99,
    category: 'Home',
    stock: 25,
    image_url: 'https://via.placeholder.com/300x300?text=Throw+Pillows',
    rating: 4.1
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with customizable lighting and tactile switches. Perfect for gaming and typing.',
    price: 129.99,
    category: 'Electronics',
    stock: 16,
    image_url: 'https://via.placeholder.com/300x300?text=Mechanical+Keyboard',
    rating: 4.7
  },
  {
    name: 'Tennis Racket',
    description: 'Professional tennis racket with graphite frame and comfortable grip. Ideal for intermediate to advanced players.',
    price: 149.99,
    category: 'Sports',
    stock: 10,
    image_url: 'https://via.placeholder.com/300x300?text=Tennis+Racket',
    rating: 4.5
  },
  {
    name: 'Air Purifier',
    description: 'HEPA air purifier with smart sensors and quiet operation. Remove allergens and pollutants from your home.',
    price: 199.99,
    category: 'Home',
    stock: 8,
    image_url: 'https://via.placeholder.com/300x300?text=Air+Purifier',
    rating: 4.4
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Connect to MySQL
    await connectMySQL();
    console.log('✅ Connected to MySQL');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.delete({}); // This will delete all products

    // Seed users in MongoDB
    console.log('👥 Seeding users...');
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ Created user: ${user.email}`);
    }

    // Seed products in MySQL
    console.log('📦 Seeding products...');
    for (const productData of sampleProducts) {
      const product = await Product.create(productData);
      console.log(`✅ Created product: ${product.name}`);
    }

    // Create categories
    console.log('🏷️  Creating categories...');
    const { getPool } = require('../config/database');
    const pool = getPool();
    
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets', image_url: 'https://via.placeholder.com/300x200?text=Electronics' },
      { name: 'Home', description: 'Home and kitchen essentials', image_url: 'https://via.placeholder.com/300x200?text=Home' },
      { name: 'Sports', description: 'Sports and fitness equipment', image_url: 'https://via.placeholder.com/300x200?text=Sports' },
      { name: 'Fashion', description: 'Clothing and accessories', image_url: 'https://via.placeholder.com/300x200?text=Fashion' },
      { name: 'Books', description: 'Books and educational materials', image_url: 'https://via.placeholder.com/300x200?text=Books' }
    ];

    for (const category of categories) {
      await pool.execute(
        'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
        [category.name, category.description, category.image_url]
      );
      console.log(`✅ Created category: ${category.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Users created: ${sampleUsers.length}
- Products created: ${sampleProducts.length}
- Categories created: ${categories.length}

🔐 Demo Accounts:
- Customer: customer@demo.com / 123456
- Admin: admin@demo.com / admin123
- Manager: manager@demo.com / manager123
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connections
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
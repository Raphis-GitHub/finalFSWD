// js/data/mockData.js

// Mock product data
const mockProducts = [
    { 
        id: 1, 
        name: 'Wireless Headphones', 
        price: 99.99, 
        category: 'Electronics', 
        image: 'https://via.placeholder.com/300x300?text=Headphones', 
        stock: 15, 
        rating: 4.5, 
        description: 'High-quality wireless headphones with noise cancellation',
        comments: [
            { id: 1, userId: 1, userName: 'John Customer', rating: 5, comment: 'Amazing sound quality!', date: '2025-07-20' },
            { id: 2, userId: 2, userName: 'Jane Admin', rating: 4, comment: 'Good product, fast delivery.', date: '2025-07-22' }
        ]
    },
    { 
        id: 2, 
        name: 'Smart Watch', 
        price: 299.99, 
        category: 'Electronics', 
        image: 'https://via.placeholder.com/300x300?text=Smart+Watch', 
        stock: 8, 
        rating: 4.8, 
        description: 'Advanced smartwatch with health tracking features',
        comments: [
            { id: 3, userId: 1, userName: 'John Customer', rating: 5, comment: 'Love the health features!', date: '2025-07-15' }
        ]
    },
    { 
        id: 3, 
        name: 'Coffee Maker', 
        price: 159.99, 
        category: 'Home', 
        image: 'https://via.placeholder.com/300x300?text=Coffee+Maker', 
        stock: 12, 
        rating: 4.3, 
        description: 'Programmable coffee maker with built-in grinder',
        comments: []
    },
    { 
        id: 4, 
        name: 'Running Shoes', 
        price: 129.99, 
        category: 'Sports', 
        image: 'https://via.placeholder.com/300x300?text=Running+Shoes', 
        stock: 25, 
        rating: 4.6, 
        description: 'Comfortable running shoes with advanced cushioning',
        comments: [
            { id: 4, userId: 2, userName: 'Jane Admin', rating: 5, comment: 'Perfect for long runs!', date: '2025-07-18' }
        ]
    },
    { 
        id: 5, 
        name: 'Desk Lamp', 
        price: 45.99, 
        category: 'Home', 
        image: 'https://via.placeholder.com/300x300?text=Desk+Lamp', 
        stock: 30, 
        rating: 4.2, 
        description: 'LED desk lamp with adjustable brightness',
        comments: []
    },
    { 
        id: 6, 
        name: 'Bluetooth Speaker', 
        price: 79.99, 
        category: 'Electronics', 
        image: 'https://via.placeholder.com/300x300?text=Speaker', 
        stock: 18, 
        rating: 4.4, 
        description: 'Portable Bluetooth speaker with premium sound quality',
        comments: [
            { id: 5, userId: 1, userName: 'John Customer', rating: 4, comment: 'Great bass response!', date: '2025-07-25' }
        ]
    },
    {
        id: 7,
        name: 'Gaming Laptop',
        price: 1299.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x300?text=Gaming+Laptop',
        stock: 5,
        rating: 4.7,
        description: 'High-performance gaming laptop with RTX graphics',
        comments: []
    },
    {
        id: 8,
        name: 'Yoga Mat',
        price: 39.99,
        category: 'Sports',
        image: 'https://via.placeholder.com/300x300?text=Yoga+Mat',
        stock: 40,
        rating: 4.3,
        description: 'Non-slip yoga mat for all fitness levels',
        comments: []
    },
    {
        id: 9,
        name: 'Kitchen Knife Set',
        price: 89.99,
        category: 'Home',
        image: 'https://via.placeholder.com/300x300?text=Knife+Set',
        stock: 20,
        rating: 4.6,
        description: 'Professional chef knife set with wooden block',
        comments: []
    },
    {
        id: 10,
        name: 'Tablet 10-inch',
        price: 349.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x300?text=Tablet',
        stock: 15,
        rating: 4.4,
        description: '10-inch tablet with high-resolution display',
        comments: []
    },
    {
        id: 11,
        name: 'Basketball',
        price: 29.99,
        category: 'Sports',
        image: 'https://via.placeholder.com/300x300?text=Basketball',
        stock: 35,
        rating: 4.2,
        description: 'Official size basketball for indoor/outdoor play',
        comments: []
    },
    {
        id: 12,
        name: 'Throw Pillows Set',
        price: 49.99,
        category: 'Home',
        image: 'https://via.placeholder.com/300x300?text=Pillows',
        stock: 25,
        rating: 4.1,
        description: 'Set of 4 decorative throw pillows',
        comments: []
    },
    {
        id: 13,
        name: 'Wireless Mouse',
        price: 24.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x300?text=Mouse',
        stock: 50,
        rating: 4.0,
        description: 'Ergonomic wireless mouse with long battery life',
        comments: []
    },
    {
        id: 14,
        name: 'Tennis Racket',
        price: 149.99,
        category: 'Sports',
        image: 'https://via.placeholder.com/300x300?text=Tennis+Racket',
        stock: 10,
        rating: 4.5,
        description: 'Professional tennis racket for intermediate players',
        comments: []
    },
    {
        id: 15,
        name: 'Air Purifier',
        price: 199.99,
        category: 'Home',
        image: 'https://via.placeholder.com/300x300?text=Air+Purifier',
        stock: 8,
        rating: 4.4,
        description: 'HEPA air purifier for clean indoor air',
        comments: []
    },
    {
        id: 16,
        name: 'Smartphone',
        price: 699.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x300?text=Smartphone',
        stock: 12,
        rating: 4.6,
        description: 'Latest smartphone with advanced camera system',
        comments: []
    },
    {
        id: 17,
        name: 'Dumbbells Set',
        price: 89.99,
        category: 'Sports',
        image: 'https://via.placeholder.com/300x300?text=Dumbbells',
        stock: 18,
        rating: 4.3,
        description: 'Adjustable dumbbells set for home workouts',
        comments: []
    },
    {
        id: 18,
        name: 'Floor Lamp',
        price: 79.99,
        category: 'Home',
        image: 'https://via.placeholder.com/300x300?text=Floor+Lamp',
        stock: 22,
        rating: 4.2,
        description: 'Modern floor lamp with adjustable height',
        comments: []
    },
    {
        id: 19,
        name: 'Mechanical Keyboard',
        price: 129.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x300?text=Keyboard',
        stock: 16,
        rating: 4.7,
        description: 'RGB mechanical keyboard for gaming and typing',
        comments: []
    },
    {
        id: 20,
        name: 'Soccer Ball',
        price: 34.99,
        category: 'Sports',
        image: 'https://via.placeholder.com/300x300?text=Soccer+Ball',
        stock: 28,
        rating: 4.1,
        description: 'Official size soccer ball for training and matches',
        comments: []
    }
];

// Mock user data
const mockUsers = [
    { 
        id: 1, 
        email: 'customer@demo.com', 
        password: '123456', 
        role: 'customer', 
        name: 'John Customer', 
        address: '123 Main St', 
        phone: '+1-555-0123' 
    },
    { 
        id: 2, 
        email: 'admin@demo.com', 
        password: 'admin123', 
        role: 'admin', 
        name: 'Jane Admin', 
        address: '456 Admin Ave', 
        phone: '+1-555-0456' 
    }
];

// Mock order data
const mockOrders = [
    { 
        id: 1, 
        userId: 1, 
        items: [{ 
            productId: 1, 
            name: 'Wireless Headphones', 
            quantity: 1, 
            price: 99.99 
        }], 
        total: 99.99, 
        status: 'delivered', 
        date: '2025-07-25', 
        shippingAddress: '123 Main St' 
    },
    { 
        id: 2, 
        userId: 1, 
        items: [{ 
            productId: 2, 
            name: 'Smart Watch', 
            quantity: 1, 
            price: 299.99 
        }], 
        total: 299.99, 
        status: 'processing', 
        date: '2025-07-28', 
        shippingAddress: '123 Main St' 
    }
];
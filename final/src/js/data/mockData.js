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
        description: 'High-quality wireless headphones with noise cancellation' 
    },
    { 
        id: 2, 
        name: 'Smart Watch', 
        price: 299.99, 
        category: 'Electronics', 
        image: 'https://via.placeholder.com/300x300?text=Smart+Watch', 
        stock: 8, 
        rating: 4.8, 
        description: 'Advanced smartwatch with health tracking features' 
    },
    { 
        id: 3, 
        name: 'Coffee Maker', 
        price: 159.99, 
        category: 'Home', 
        image: 'https://via.placeholder.com/300x300?text=Coffee+Maker', 
        stock: 12, 
        rating: 4.3, 
        description: 'Programmable coffee maker with built-in grinder' 
    },
    { 
        id: 4, 
        name: 'Running Shoes', 
        price: 129.99, 
        category: 'Sports', 
        image: 'https://via.placeholder.com/300x300?text=Running+Shoes', 
        stock: 25, 
        rating: 4.6, 
        description: 'Comfortable running shoes with advanced cushioning' 
    },
    { 
        id: 5, 
        name: 'Desk Lamp', 
        price: 45.99, 
        category: 'Home', 
        image: 'https://via.placeholder.com/300x300?text=Desk+Lamp', 
        stock: 30, 
        rating: 4.2, 
        description: 'LED desk lamp with adjustable brightness' 
    },
    { 
        id: 6, 
        name: 'Bluetooth Speaker', 
        price: 79.99, 
        category: 'Electronics', 
        image: 'https://via.placeholder.com/300x300?text=Speaker', 
        stock: 18, 
        rating: 4.4, 
        description: 'Portable Bluetooth speaker with premium sound quality' 
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
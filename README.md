# ShopHub - Full-Stack E-commerce Application

A comprehensive full-stack e-commerce application built with React, Node.js, Express, MySQL, and MongoDB. Features real-time updates, user authentication, role-based permissions, and a complete admin dashboard.

## 🚀 Features

### Frontend (React)
- **Responsive Design**: Mobile and desktop layouts
- **React Router**: Protected routes and navigation
- **Real-time Updates**: WebSocket integration for live updates
- **User Authentication**: Login, registration, and profile management
- **Shopping Cart**: Add, remove, and manage cart items
- **Wishlist**: Save favorite products
- **Product Catalog**: Browse, search, and filter products
- **Order Management**: Place orders and track status
- **Admin Dashboard**: Complete management interface

### Backend (Node.js/Express)
- **RESTful API**: Well-structured API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Customer, Manager, and Admin roles
- **Real-time Communication**: Socket.IO for live updates
- **File Upload**: Image upload with validation
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: API request rate limiting

### Databases
- **MySQL**: Product data, orders, inventory tracking
- **MongoDB**: User authentication, sessions, preferences

### Additional Technologies
- **WebSocket**: Real-time notifications and updates
- **Multer**: File upload handling
- **Bcrypt**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logging

## 📋 Requirements Met

✅ **Full Application - End-to-End**
- Multiple user types (Customer, Admin, Manager)
- Complete user authentication system
- Role-based permissions
- Comprehensive product management
- Order processing and tracking
- Real-time notifications

✅ **UI Mechanisms**
- Full functionality with friendly design
- Responsive layouts (Computer & Phone)
- Modern React components architecture

✅ **React Client Mechanisms**
- Organized component and page structure
- Protected routing with React Router
- Context API for state management

✅ **Communication Mechanisms**
- Generic fetch approaches with API service layer
- Well-defined REST API endpoints
- Real-time WebSocket communication

✅ **Node.js Mechanisms**
- Express server with modular architecture
- Organized routes and controllers
- File upload support

✅ **Database Mechanisms**
- MySQL for relational data (products, orders)
- MongoDB for user authentication and sessions
- Proper table relationships and schemas

✅ **User Management**
- Multiple user types with different permissions
- Secure password management with bcrypt
- JWT-based authentication

✅ **Additional Technologies**
- MVC architecture (Models, Views, Controllers)
- Express middleware integration
- JWT token management
- Mock external API integrations

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finalFSWD
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # MySQL Database
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=shophub_db
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/shophub_auth
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=15m
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_REFRESH_EXPIRE=7d
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Setup databases**
   - Create MySQL database: `CREATE DATABASE shophub_db;`
   - MongoDB will be created automatically

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd final
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Demo Accounts

After seeding the database, you can use these demo accounts:

- **Customer**: customer@demo.com / 123456
- **Admin**: admin@demo.com / admin123
- **Manager**: manager@demo.com / manager123

## 📁 Project Structure

```
finalFSWD/
├── server/                 # Backend application
│   ├── config/            # Database configurations
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   ├── scripts/          # Database seeding scripts
│   └── server.js         # Main server file
│
├── final/                 # Frontend application
│   ├── src/
│   │   ├── js/
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts
│   │   │   ├── pages/       # Page components
│   │   │   ├── services/    # API services
│   │   │   └── utils/       # Utility functions
│   │   └── styles/          # CSS files
│   └── public/            # Static assets
│
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### File Upload
- `POST /api/upload/avatar` - Upload user avatar
- `POST /api/upload/product-image` - Upload product image

## 🚦 Running Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd final
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Ensure databases are accessible
3. Use PM2 or similar for process management
4. Set up reverse proxy (nginx)

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Update API URLs for production

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS configuration
- File upload validation
- SQL injection prevention
- XSS protection

## 🎯 Key Features Highlights

1. **Real-time Updates**: Product changes, order status updates, and notifications
2. **Responsive Design**: Works seamlessly on desktop and mobile
3. **Role-based Access**: Different interfaces for customers, managers, and admins
4. **Comprehensive Admin Panel**: Product management, order tracking, analytics
5. **Secure Authentication**: JWT tokens with refresh mechanism
6. **File Upload**: Image upload for products and user avatars
7. **Search & Filter**: Advanced product search and filtering
8. **Order Management**: Complete order lifecycle from creation to delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team - Full-stack E-commerce Application

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Note**: This is a complete full-stack application that meets all the specified requirements for a comprehensive e-commerce platform with modern web technologies.
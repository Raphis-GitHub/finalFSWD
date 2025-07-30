// Modern App.js with React Router and API integration
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext-new';
import { CartProvider } from './contexts/CartContext-new';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation-simple';
import HomePage from './pages/HomePage-simple';
import { 
    ProductsPage, 
    ProductPage, 
    CartPage, 
    LoginPage, 
    RegisterPage, 
    AccountPage, 
    AdminDashboard 
} from './pages/placeholder-pages';
import NotFoundPage from './pages/NotFoundPage';
import socketService from './services/socketService';
import apiService from './services/api';

const App = () => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize socket connection when user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            socketService.connect(token);
        }

        return () => {
            socketService.disconnect();
        };
    }, []);

    return React.createElement(Router, null,
        React.createElement(AuthProvider, null,
            React.createElement(CartProvider, null,
                React.createElement('div', {
                    className: "min-h-screen bg-gray-50"
                }, [
                    React.createElement(Navigation, {
                        key: 'navigation',
                        isMobile
                    }),
                    
                    React.createElement('main', {
                        key: 'main',
                        className: "pt-16"
                    }, React.createElement(Routes, null, [
                        // Public routes
                        React.createElement(Route, {
                            key: 'home',
                            path: '/',
                            element: React.createElement(HomePage)
                        }),
                        React.createElement(Route, {
                            key: 'products',
                            path: '/products',
                            element: React.createElement(ProductsPage)
                        }),
                        React.createElement(Route, {
                            key: 'product',
                            path: '/product/:id',
                            element: React.createElement(ProductPage)
                        }),
                        React.createElement(Route, {
                            key: 'login',
                            path: '/login',
                            element: React.createElement(LoginPage)
                        }),
                        React.createElement(Route, {
                            key: 'register',
                            path: '/register',
                            element: React.createElement(RegisterPage)
                        }),

                        // Protected routes (require authentication)
                        React.createElement(Route, {
                            key: 'cart',
                            path: '/cart',
                            element: React.createElement(ProtectedRoute, null,
                                React.createElement(CartPage)
                            )
                        }),
                        React.createElement(Route, {
                            key: 'account',
                            path: '/account',
                            element: React.createElement(ProtectedRoute, null,
                                React.createElement(AccountPage)
                            )
                        }),

                        // Admin routes (require admin role)
                        React.createElement(Route, {
                            key: 'admin',
                            path: '/admin/*',
                            element: React.createElement(ProtectedRoute, {
                                roles: ['admin', 'manager']
                            }, React.createElement(AdminDashboard))
                        }),

                        // 404 route
                        React.createElement(Route, {
                            key: 'not-found',
                            path: '*',
                            element: React.createElement(NotFoundPage)
                        })
                    ]))
                ])
            )
        )
    );
};

export default App;
// Modern App.js with React Router and API integration
import React, { useEffect, useState, createElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import socketService from './services/socketService';
import apiService from './services/api';

const App = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    return createElement(Router, null,
        createElement(AuthProvider, null,
            createElement(CartProvider, null,
                createElement('div', {
                    className: "min-h-screen bg-gray-50"
                }, [
                    createElement(Navigation, {
                        key: 'navigation',
                        isMobile
                    }),
                    
                    createElement('main', {
                        key: 'main',
                        className: "pt-16"
                    }, createElement(Routes, null, [
                        // Public routes
                        createElement(Route, {
                            key: 'home',
                            path: '/',
                            element: createElement(HomePage)
                        }),
                        createElement(Route, {
                            key: 'products',
                            path: '/products',
                            element: createElement(ProductsPage)
                        }),
                        createElement(Route, {
                            key: 'login',
                            path: '/login',
                            element: createElement(LoginPage)
                        }),
                        createElement(Route, {
                            key: 'register',
                            path: '/register',
                            element: createElement(RegisterPage)
                        }),

                        // Protected routes (require authentication)
                        createElement(Route, {
                            key: 'cart',
                            path: '/cart',
                            element: createElement(ProtectedRoute, null,
                                createElement(CartPage)
                            )
                        }),
                        createElement(Route, {
                            key: 'account',
                            path: '/account',
                            element: createElement(ProtectedRoute, null,
                                createElement(AccountPage)
                            )
                        }),

                        // Admin routes (require admin role)
                        createElement(Route, {
                            key: 'admin',
                            path: '/admin/*',
                            element: createElement(ProtectedRoute, {
                                roles: ['admin', 'manager']
                            }, createElement(AdminDashboard))
                        }),

                        // 404 route
                        createElement(Route, {
                            key: 'not-found',
                            path: '*',
                            element: createElement(NotFoundPage)
                        })
                    ]))
                ])
            )
        )
    );
};

export default App;
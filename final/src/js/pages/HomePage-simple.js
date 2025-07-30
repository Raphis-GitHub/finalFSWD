// Simple HomePage component
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [backendStatus, setBackendStatus] = React.useState('checking');

    React.useEffect(() => {
        // Check if backend is running
        const checkBackend = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/health');
                if (response.ok) {
                    setBackendStatus('connected');
                } else {
                    setBackendStatus('error');
                }
            } catch (error) {
                setBackendStatus('disconnected');
            }
        };

        checkBackend();
        const interval = setInterval(checkBackend, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (backendStatus) {
            case 'connected': return 'text-green-600 bg-green-100 border-green-400';
            case 'disconnected': return 'text-red-600 bg-red-100 border-red-400';
            case 'error': return 'text-yellow-600 bg-yellow-100 border-yellow-400';
            default: return 'text-blue-600 bg-blue-100 border-blue-400';
        }
    };

    const getStatusMessage = () => {
        switch (backendStatus) {
            case 'connected': return '✅ Backend Connected - Full functionality available';
            case 'disconnected': return '❌ Backend Disconnected - Start server on port 5000';
            case 'error': return '⚠️ Backend Error - Check server logs';
            default: return '🔄 Checking backend connection...';
        }
    };

    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        // Hero Section
        React.createElement('div', {
            key: 'hero',
            className: "bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8 mb-12"
        }, React.createElement('div', {
            className: "max-w-3xl"
        }, [
            React.createElement('h1', {
                key: 'hero-title',
                className: "text-4xl md:text-5xl font-bold mb-4"
            }, 'Welcome to ShopHub'),
            React.createElement('p', {
                key: 'hero-desc',
                className: "text-xl mb-6"
            }, 'Full-Stack E-commerce Platform with React, Node.js, MySQL & MongoDB'),
            React.createElement(Link, {
                key: 'hero-cta',
                to: '/products',
                className: "inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            }, 'Browse Products')
        ])),

        // Status Section
        React.createElement('div', {
            key: 'status',
            className: "mb-12"
        }, React.createElement('div', {
            className: `border px-4 py-3 rounded ${getStatusColor()}`
        }, [
            React.createElement('p', {
                key: 'status-message',
                className: "font-semibold"
            }, getStatusMessage()),
            backendStatus === 'connected' && React.createElement('p', {
                key: 'demo-accounts',
                className: "text-sm mt-2"
            }, 'Demo: customer@demo.com/123456 | admin@demo.com/admin123')
        ])),

        // Features Section
        React.createElement('div', {
            key: 'features',
            className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        }, [
            React.createElement('div', {
                key: 'feature-1',
                className: "text-center p-6 bg-white rounded-lg shadow-md"
            }, [
                React.createElement('div', {
                    key: 'feature-1-icon',
                    className: "text-4xl mb-4"
                }, '🛒'),
                React.createElement('h3', {
                    key: 'feature-1-title',
                    className: "text-lg font-semibold mb-2"
                }, 'Shopping Cart'),
                React.createElement('p', {
                    key: 'feature-1-desc',
                    className: "text-gray-600"
                }, 'Add products to cart and checkout securely')
            ]),
            React.createElement('div', {
                key: 'feature-2',
                className: "text-center p-6 bg-white rounded-lg shadow-md"
            }, [
                React.createElement('div', {
                    key: 'feature-2-icon',
                    className: "text-4xl mb-4"
                }, '👤'),
                React.createElement('h3', {
                    key: 'feature-2-title',
                    className: "text-lg font-semibold mb-2"
                }, 'User Accounts'),
                React.createElement('p', {
                    key: 'feature-2-desc',
                    className: "text-gray-600"
                }, 'Multiple user types with role-based access')
            ]),
            React.createElement('div', {
                key: 'feature-3',
                className: "text-center p-6 bg-white rounded-lg shadow-md"
            }, [
                React.createElement('div', {
                    key: 'feature-3-icon',
                    className: "text-4xl mb-4"
                }, '⚡'),
                React.createElement('h3', {
                    key: 'feature-3-title',
                    className: "text-lg font-semibold mb-2"
                }, 'Real-time Updates'),
                React.createElement('p', {
                    key: 'feature-3-desc',
                    className: "text-gray-600"
                }, 'Live notifications and instant updates')
            ])
        ]),

        // Quick Actions
        React.createElement('div', {
            key: 'actions',
            className: "text-center"
        }, [
            React.createElement('h2', {
                key: 'actions-title',
                className: "text-2xl font-bold text-gray-900 mb-6"
            }, 'Get Started'),
            React.createElement('div', {
                key: 'actions-buttons',
                className: "space-x-4"
            }, [
                React.createElement(Link, {
                    key: 'products-btn',
                    to: '/products',
                    className: "inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                }, 'Browse Products'),
                React.createElement(Link, {
                    key: 'login-btn',
                    to: '/login',
                    className: "inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
                }, 'Login / Register')
            ])
        ])
    ]);
};

export default HomePage;
// Placeholder page components
import React from 'react';
import { Link } from 'react-router-dom';

export const ProductsPage = () => {
    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('h1', {
            key: 'title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'Products'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 mb-4"
        }, 'Products page coming soon! Full product catalog with search and filtering.'),
        React.createElement(Link, {
            key: 'back-link',
            to: '/',
            className: "text-blue-600 hover:text-blue-800"
        }, '← Back to Home')
    ]);
};

export const ProductPage = () => {
    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('h1', {
            key: 'title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'Product Details'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 mb-4"
        }, 'Product details page coming soon!'),
        React.createElement(Link, {
            key: 'back-link',
            to: '/products',
            className: "text-blue-600 hover:text-blue-800"
        }, '← Back to Products')
    ]);
};

export const CartPage = () => {
    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('h1', {
            key: 'title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'Shopping Cart'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 mb-4"
        }, 'Shopping cart functionality coming soon!'),
        React.createElement(Link, {
            key: 'back-link',
            to: '/',
            className: "text-blue-600 hover:text-blue-800"
        }, '← Continue Shopping')
    ]);
};

export const LoginPage = () => {
    return React.createElement('div', {
        className: "max-w-md mx-auto mt-12 px-4"
    }, React.createElement('div', {
        className: "bg-white rounded-lg shadow-md p-8"
    }, [
        React.createElement('h2', {
            key: 'title',
            className: "text-2xl font-bold text-gray-900 mb-6 text-center"
        }, 'Login'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 text-center mb-6"
        }, 'Login functionality coming soon!'),
        React.createElement('div', {
            key: 'demo-info',
            className: "bg-blue-50 p-4 rounded-lg mb-6"
        }, [
            React.createElement('h3', {
                key: 'demo-title',
                className: "font-semibold text-blue-900 mb-2"
            }, 'Demo Accounts Available:'),
            React.createElement('p', {
                key: 'customer-demo',
                className: "text-sm text-blue-800 mb-1"
            }, 'Customer: customer@demo.com / 123456'),
            React.createElement('p', {
                key: 'admin-demo',
                className: "text-sm text-blue-800"
            }, 'Admin: admin@demo.com / admin123')
        ]),
        React.createElement(Link, {
            key: 'back-link',
            to: '/',
            className: "block text-center text-blue-600 hover:text-blue-800"
        }, '← Back to Home')
    ]));
};

export const RegisterPage = () => {
    return React.createElement('div', {
        className: "max-w-md mx-auto mt-12 px-4"
    }, React.createElement('div', {
        className: "bg-white rounded-lg shadow-md p-8"
    }, [
        React.createElement('h2', {
            key: 'title',
            className: "text-2xl font-bold text-gray-900 mb-6 text-center"
        }, 'Register'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 text-center mb-6"
        }, 'Registration functionality coming soon!'),
        React.createElement(Link, {
            key: 'back-link',
            to: '/',
            className: "block text-center text-blue-600 hover:text-blue-800"
        }, '← Back to Home')
    ]));
};

export const AccountPage = () => {
    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('h1', {
            key: 'title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'My Account'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 mb-4"
        }, 'Account management coming soon!'),
        React.createElement(Link, {
            key: 'back-link',
            to: '/',
            className: "text-blue-600 hover:text-blue-800"
        }, '← Back to Home')
    ]);
};

export const AdminDashboard = () => {
    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('h1', {
            key: 'title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'Admin Dashboard'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 mb-4"
        }, 'Admin dashboard with full management capabilities coming soon!'),
        React.createElement(Link, {
            key: 'back-link',
            to: '/',
            className: "text-blue-600 hover:text-blue-800"
        }, '← Back to Home')
    ]);
};
// Simplified Navigation component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ isMobile }) => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const location = useLocation();

    React.useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/products', label: 'Products' }
    ];

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        window.location.href = '/';
    };

    return React.createElement('nav', {
        className: "fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
    }, React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    }, React.createElement('div', {
        className: "flex justify-between items-center h-16"
    }, [
        // Logo
        React.createElement(Link, {
            key: 'logo',
            to: '/',
            className: "text-2xl font-bold text-blue-600"
        }, 'ShopHub'),

        // Desktop Navigation
        !isMobile && React.createElement('div', {
            key: 'desktop-nav',
            className: "flex items-center space-x-8"
        }, [
            // Nav Items
            React.createElement('div', {
                key: 'nav-items',
                className: "flex items-center space-x-4"
            }, navItems.map(item => React.createElement(Link, {
                key: item.path,
                to: item.path,
                className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600'
                }`
            }, item.label))),

            // User Actions
            React.createElement('div', {
                key: 'user-actions',
                className: "flex items-center space-x-4"
            }, currentUser ? [
                React.createElement(Link, {
                    key: 'cart-btn',
                    to: '/cart',
                    className: "p-2 rounded-md text-gray-700 hover:text-blue-600 transition-colors"
                }, '🛒'),
                React.createElement(Link, {
                    key: 'account-btn',
                    to: '/account',
                    className: "p-2 rounded-md text-gray-700 hover:text-blue-600 transition-colors"
                }, '👤'),
                currentUser.role === 'admin' && React.createElement(Link, {
                    key: 'admin-btn',
                    to: '/admin',
                    className: "p-2 rounded-md text-gray-700 hover:text-blue-600 transition-colors"
                }, '⚙️'),
                React.createElement('button', {
                    key: 'logout-btn',
                    onClick: logout,
                    className: "px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                }, 'Logout')
            ] : [
                React.createElement(Link, {
                    key: 'login-btn',
                    to: '/login',
                    className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                }, 'Login')
            ])
        ]),

        // Mobile Menu Button
        isMobile && React.createElement('button', {
            key: 'mobile-menu-btn',
            onClick: () => setShowMobileMenu(!showMobileMenu),
            className: "p-2 rounded-md text-gray-700"
        }, showMobileMenu ? '✕' : '☰')
    ])));
};

export default Navigation;
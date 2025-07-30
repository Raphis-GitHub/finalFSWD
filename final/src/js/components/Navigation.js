// js/components/Navigation.js
import React, { useState, createElement, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { SearchIcon, CartIcon, UserIcon, LogoutIcon, MenuIcon, CloseIcon } from '../utils/icons';

const Navigation = ({ currentPage, setCurrentPage, searchQuery, setSearchQuery, isMobile }) => {
    const { currentUser, logout } = useAuth();
    const { cartItemCount } = useCart();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'products', label: 'Products' }
    ];

    return createElement('nav', {
        className: "fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
    }, createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    }, [
        createElement('div', {
            key: 'nav-container',
            className: "flex justify-between items-center h-16"
        }, [
            createElement('div', {
                key: 'logo',
                className: "flex items-center"
            }, createElement('button', {
                onClick: () => setCurrentPage('home'),
                className: "text-2xl font-bold text-blue-600"
            }, 'ShopHub')),

            !isMobile && createElement(Fragment, { key: 'desktop-nav' }, [
                createElement('div', {
                    key: 'nav-items',
                    className: "flex items-center space-x-8"
                }, navItems.map(item => createElement('button', {
                    key: item.id,
                    onClick: () => setCurrentPage(item.id),
                    className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                    }`
                }, item.label))),

                createElement('div', {
                    key: 'search-bar',
                    className: "flex-1 max-w-lg mx-8"
                }, createElement('div', {
                    className: "relative"
                }, [
                    createElement('div', {
                        key: 'search-icon',
                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    }, createElement(SearchIcon)),
                    createElement('input', {
                        key: 'search-input',
                        type: "text",
                        placeholder: "Search products...",
                        value: searchQuery,
                        onChange: (e) => setSearchQuery(e.target.value),
                        className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    })
                ])),

                createElement('div', {
                    key: 'user-actions',
                    className: "flex items-center space-x-4"
                }, currentUser ? [
                    createElement('button', {
                        key: 'cart-btn',
                        onClick: () => setCurrentPage('cart'),
                        className: `relative p-2 rounded-md transition-colors ${
                            currentPage === 'cart' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                        }`
                    }, [
                        createElement(CartIcon, {
                            key: 'cart-icon'
                        }),
                        cartItemCount > 0 && createElement('span', {
                            key: 'cart-badge',
                            className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        }, cartItemCount)
                    ]),
                    createElement('button', {
                        key: 'profile-btn',
                        onClick: () => setCurrentPage('account'),
                        className: `p-2 rounded-md transition-colors ${
                            currentPage === 'account' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                        }`,
                        title: "My Account"
                    }, createElement(UserIcon)),
                    currentUser.role === 'admin' && createElement('button', {
                        key: 'admin-btn',
                        onClick: () => setCurrentPage('admin'),
                        className: `p-2 rounded-md transition-colors ${
                            currentPage === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                        }`,
                        title: "Admin Dashboard"
                    }, '⚙️'),
                    createElement('button', {
                        key: 'logout-btn',
                        onClick: logout,
                        className: "p-2 text-gray-700 hover:text-red-600 rounded-md transition-colors",
                        title: "Logout"
                    }, createElement(LogoutIcon))
                ] : [
                    createElement('button', {
                        key: 'login-btn',
                        onClick: () => setCurrentPage('login'),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    }, 'Login')
                ])
            ]),

            isMobile && createElement('button', {
                key: 'mobile-menu-btn',
                onClick: () => setShowMobileMenu(!showMobileMenu),
                className: "p-2 rounded-md text-gray-700"
            }, createElement(showMobileMenu ? CloseIcon : MenuIcon))
        ])
    ]));
};

export default Navigation;
// 404 Not Found page
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return React.createElement('div', {
        className: "min-h-screen flex items-center justify-center px-4"
    }, React.createElement('div', {
        className: "text-center max-w-md mx-auto"
    }, [
        React.createElement('div', {
            key: 'icon',
            className: "text-8xl mb-6"
        }, '🔍'),
        React.createElement('h1', {
            key: 'title',
            className: "text-4xl font-bold text-gray-900 mb-4"
        }, '404'),
        React.createElement('h2', {
            key: 'subtitle',
            className: "text-2xl font-semibold text-gray-700 mb-4"
        }, 'Page Not Found'),
        React.createElement('p', {
            key: 'message',
            className: "text-gray-600 mb-8"
        }, 'The page you are looking for might have been removed or is temporarily unavailable.'),
        React.createElement('div', {
            key: 'actions',
            className: "space-y-4"
        }, [
            React.createElement(Link, {
                key: 'home-link',
                to: '/',
                className: "inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            }, 'Go Home'),
            React.createElement('div', {key: 'spacer'}),
            React.createElement(Link, {
                key: 'products-link',
                to: '/products',
                className: "inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
            }, 'Browse Products')
        ])
    ]));
};

export default NotFoundPage;
// Simple test App component
import React from 'react';

const App = () => {
    return React.createElement('div', {
        className: "min-h-screen bg-gray-50 flex items-center justify-center"
    }, React.createElement('div', {
        className: "text-center max-w-md mx-auto px-4"
    }, [
        React.createElement('div', {
            key: 'logo',
            className: "text-6xl mb-6"
        }, '🛒'),
        React.createElement('h1', {
            key: 'title',
            className: "text-4xl font-bold text-gray-900 mb-4"
        }, 'ShopHub'),
        React.createElement('p', {
            key: 'subtitle',
            className: "text-xl text-gray-600 mb-8"
        }, 'Full-Stack E-Commerce Platform'),
        React.createElement('div', {
            key: 'status',
            className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
        }, [
            React.createElement('p', {
                key: 'status-text',
                className: "font-semibold"
            }, '✅ Frontend is running successfully!'),
            React.createElement('p', {
                key: 'next-steps',
                className: "text-sm mt-2"
            }, 'Next: Make sure your backend is running on port 5000')
        ])
    ]));
};

export default App;
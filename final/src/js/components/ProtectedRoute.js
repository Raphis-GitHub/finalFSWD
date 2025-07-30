// Protected Route component for authentication
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Temporarily use localStorage instead of useAuth hook

const ProtectedRoute = ({ children, roles = [] }) => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const location = useLocation();

    React.useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Show loading while checking authentication
    if (loading) {
        return React.createElement('div', {
            className: "min-h-screen flex items-center justify-center"
        }, React.createElement('div', {
            className: "text-center"
        }, [
            React.createElement('div', {
                key: 'spinner',
                className: "loading-spinner mx-auto mb-4"
            }),
            React.createElement('p', {
                key: 'text',
                className: "text-gray-600"
            }, 'Loading...')
        ]));
    }

    // Redirect to login if not authenticated
    if (!currentUser) {
        return React.createElement(Navigate, {
            to: '/login',
            state: { from: location },
            replace: true
        });
    }

    // Check role-based access
    if (roles.length > 0 && !roles.includes(currentUser.role)) {
        return React.createElement('div', {
            className: "min-h-screen flex items-center justify-center"
        }, React.createElement('div', {
            className: "text-center max-w-md mx-auto px-4"
        }, [
            React.createElement('div', {
                key: 'icon',
                className: "text-6xl mb-4"
            }, '🚫'),
            React.createElement('h2', {
                key: 'title',
                className: "text-2xl font-bold text-gray-900 mb-4"
            }, 'Access Denied'),
            React.createElement('p', {
                key: 'message',
                className: "text-gray-600 mb-6"
            }, 'You do not have permission to access this page.'),
            React.createElement('button', {
                key: 'back-btn',
                onClick: () => window.history.back(),
                className: "bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            }, 'Go Back')
        ]));
    }

    return children;
};

export default ProtectedRoute;
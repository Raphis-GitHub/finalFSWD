// js/contexts/AuthContext.js
import React, { createContext, useContext, createElement } from 'react';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth provider component
const AuthProvider = ({ children, value }) => {
    return createElement(
        AuthContext.Provider,
        { value },
        children
    );
};

export { useAuth, AuthProvider };
// js/contexts/CartContext.js
import React, { createContext, useContext, createElement } from 'react';

// Create cart context
const CartContext = createContext();

// Custom hook to use cart context
const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Cart provider component
const CartProvider = ({ children, value }) => {
    return createElement(
        CartContext.Provider,
        { value },
        children
    );
};

export { useCart, CartProvider };
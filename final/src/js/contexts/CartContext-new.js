// Updated CartContext with API integration
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';
import socketService from '../services/socketService';
// import { useAuth } from './AuthContext-new';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload };
        case 'SET_CART':
            return { ...state, cart: action.payload };
        case 'SET_WISHLIST':
            return { ...state, wishlist: action.payload };
        case 'SET_ORDERS':
            return { ...state, orders: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'ADD_TO_CART':
            const existingItem = state.cart.find(item => item.productId === action.payload.productId);
            if (existingItem) {
                return {
                    ...state,
                    cart: state.cart.map(item =>
                        item.productId === action.payload.productId
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                };
            }
            return { ...state, cart: [...state.cart, action.payload] };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cart: state.cart.filter(item => item.productId !== action.payload)
            };
        case 'UPDATE_CART_QUANTITY':
            return {
                ...state,
                cart: state.cart.map(item =>
                    item.productId === action.payload.productId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };
        case 'TOGGLE_WISHLIST':
            const existsInWishlist = state.wishlist.some(item => item.productId === action.payload.productId);
            if (existsInWishlist) {
                return {
                    ...state,
                    wishlist: state.wishlist.filter(item => item.productId !== action.payload.productId)
                };
            }
            return { ...state, wishlist: [...state.wishlist, action.payload] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    // Temporarily get user from localStorage until we fix the circular dependency
    const [currentUser, setCurrentUser] = React.useState(null);
    
    React.useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);
    const [state, dispatch] = useReducer(cartReducer, {
        products: [],
        cart: [],
        wishlist: [],
        orders: [],
        loading: false,
        error: null
    });

    // Load user cart and wishlist when user changes
    useEffect(() => {
        if (currentUser) {
            loadUserData();
        } else {
            // Clear data when user logs out
            dispatch({ type: 'SET_CART', payload: [] });
            dispatch({ type: 'SET_WISHLIST', payload: [] });
            dispatch({ type: 'SET_ORDERS', payload: [] });
        }
    }, [currentUser]);

    // Set up socket event listeners
    useEffect(() => {
        if (currentUser) {
            // Listen for real-time cart updates
            socketService.on('cartUpdated', (data) => {
                dispatch({ type: 'SET_CART', payload: data.cart });
            });

            // Listen for real-time wishlist updates
            socketService.on('wishlistUpdated', (data) => {
                dispatch({ type: 'SET_WISHLIST', payload: data.wishlist });
            });

            // Listen for order updates
            socketService.on('orderCreated', (data) => {
                if (data.user.id === currentUser.id) {
                    loadOrders(); // Refresh orders
                }
            });

            socketService.on('orderStatusUpdated', (data) => {
                loadOrders(); // Refresh orders when status changes
            });

            return () => {
                socketService.off('cartUpdated');
                socketService.off('wishlistUpdated');
                socketService.off('orderCreated');
                socketService.off('orderStatusUpdated');
            };
        }
    }, [currentUser]);

    const loadUserData = async () => {
        try {
            const [cartResponse, wishlistResponse, ordersResponse] = await Promise.all([
                apiService.getCart(),
                apiService.getWishlist(),
                apiService.getUserOrders()
            ]);

            if (cartResponse.success) {
                dispatch({ type: 'SET_CART', payload: cartResponse.data.cart });
            }

            if (wishlistResponse.success) {
                dispatch({ type: 'SET_WISHLIST', payload: wishlistResponse.data.wishlist });
            }

            if (ordersResponse.success) {
                dispatch({ type: 'SET_ORDERS', payload: ordersResponse.data.orders });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadOrders = async () => {
        try {
            const response = await apiService.getUserOrders();
            if (response.success) {
                dispatch({ type: 'SET_ORDERS', payload: response.data.orders });
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const loadProducts = async (filters = {}) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await apiService.getProducts(filters);
            
            if (response.success) {
                dispatch({ type: 'SET_PRODUCTS', payload: response.data.products });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (!currentUser) {
            return { success: false, error: 'Please login to add items to cart' };
        }

        try {
            const response = await apiService.addToCart(product.id, quantity);
            
            if (response.success) {
                dispatch({ type: 'ADD_TO_CART', payload: { 
                    productId: product.id, 
                    quantity,
                    ...product
                }});
                
                // Emit socket event for real-time updates
                socketService.updateCart(response.data.cart);
                
                return { success: true };
            } else {
                return { success: false, error: response.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await apiService.removeFromCart(productId);
            
            if (response.success) {
                dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
                
                // Emit socket event for real-time updates
                socketService.updateCart(response.data.cart);
                
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.message };
        }
    };

    const updateCartQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }

        try {
            // For now, we'll remove and add back with new quantity
            // In a real app, you'd have a dedicated update endpoint
            await removeFromCart(productId);
            const product = state.products.find(p => p.id === productId);
            if (product) {
                return addToCart(product, quantity);
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return { success: false, error: error.message };
        }
    };

    const toggleWishlist = async (product) => {
        if (!currentUser) {
            return { success: false, error: 'Please login to manage wishlist' };
        }

        try {
            const response = await apiService.toggleWishlist(product.id);
            
            if (response.success) {
                dispatch({ type: 'TOGGLE_WISHLIST', payload: { 
                    productId: product.id,
                    ...product
                }});
                
                // Emit socket event for real-time updates
                socketService.updateWishlist(response.data.wishlist);
                
                return { success: true };
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            return { success: false, error: error.message };
        }
    };

    const placeOrder = async (orderData) => {
        if (!currentUser || state.cart.length === 0) {
            return { success: false, error: 'Invalid order data' };
        }

        try {
            const orderPayload = {
                items: state.cart.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity
                })),
                shipping_address: orderData.shippingAddress || currentUser.address,
                payment_method: orderData.paymentMethod || 'credit_card',
                order_notes: orderData.orderNotes || ''
            };

            const response = await apiService.createOrder(orderPayload);
            
            if (response.success) {
                // Clear cart after successful order
                dispatch({ type: 'SET_CART', payload: [] });
                
                // Reload orders
                loadOrders();
                
                return { success: true, order: response.data.order };
            } else {
                return { success: false, error: response.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Calculate cart totals
    const cartTotal = state.cart.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.productId);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    const value = {
        ...state,
        cartTotal,
        cartItemCount,
        loadProducts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        placeOrder,
        clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    };

    return React.createElement(CartContext.Provider, { value }, children);
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
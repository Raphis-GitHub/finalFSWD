// js/App-api.js - Version using API calls instead of localStorage
import React, { useState, useEffect, createElement } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/AdminDashboard';
import apiService from './services/api';

const ECommerceApp = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize app - check for stored auth token and load data
    useEffect(() => {
        const initializeApp = async () => {
            try {
                setLoading(true);
                
                // Check if user is logged in
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        const profileResponse = await apiService.getProfile();
                        if (profileResponse.success) {
                            setCurrentUser(profileResponse.data.user);
                        }
                    } catch (error) {
                        console.error('Failed to get profile:', error);
                        // Clear invalid token
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('currentUser');
                    }
                }

                // Load products
                const productsResponse = await apiService.getProducts();
                if (productsResponse.success) {
                    setProducts(productsResponse.data.products);
                }

                // Load cart from localStorage (for non-logged in users)
                const storedCart = localStorage.getItem('cart');
                if (storedCart) {
                    try {
                        setCart(JSON.parse(storedCart));
                    } catch (error) {
                        console.error('Failed to parse stored cart:', error);
                    }
                }

            } catch (error) {
                console.error('Failed to initialize app:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Load user-specific wishlist when user changes
    useEffect(() => {
        if (currentUser) {
            const userWishlistKey = `wishlist_${currentUser.id}`;
            const userWishlist = localStorage.getItem(userWishlistKey);
            if (userWishlist) {
                try {
                    setWishlist(JSON.parse(userWishlist));
                } catch (error) {
                    console.error('Failed to parse wishlist:', error);
                    setWishlist([]);
                }
            }
        } else {
            setWishlist([]);
        }
    }, [currentUser]);

    // Authentication functions
    const login = async (email, password) => {
        try {
            const response = await apiService.login(email, password);
            if (response.success) {
                setCurrentUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiService.register(userData);
            if (response.success) {
                setCurrentUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        setCurrentUser(null);
        setCart([]);
        setWishlist([]);
        setCurrentPage('home');
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await apiService.updateProfile(profileData);
            if (response.success) {
                setCurrentUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Failed to update profile.' };
        }
    };

    // Cart functions
    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Wishlist functions
    const toggleWishlist = (product) => {
        if (!currentUser) {
            alert('Please log in to add items to wishlist');
            return;
        }

        setWishlist(prevWishlist => {
            const isInWishlist = prevWishlist.some(item => item.id === product.id);
            let newWishlist;
            
            if (isInWishlist) {
                newWishlist = prevWishlist.filter(item => item.id !== product.id);
            } else {
                newWishlist = [...prevWishlist, product];
            }
            
            // Save to localStorage
            const userWishlistKey = `wishlist_${currentUser.id}`;
            localStorage.setItem(userWishlistKey, JSON.stringify(newWishlist));
            
            return newWishlist;
        });
    };

    const placeOrder = async (orderData) => {
        if (!currentUser) {
            return { success: false, error: 'Please log in to place an order' };
        }

        try {
            // Create order object
            const order = {
                userId: currentUser.id,
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: cartTotal,
                status: 'processing',
                date: new Date().toLocaleDateString(),
                shippingAddress: orderData.shippingAddress || currentUser.address,
                ...orderData
            };

            // For now, just add to local orders (in a real app, this would be an API call)
            setOrders(prevOrders => [...prevOrders, { ...order, id: Date.now() }]);
            
            // Clear cart
            setCart([]);
            
            return { success: true };
        } catch (error) {
            console.error('Place order error:', error);
            return { success: false, error: 'Failed to place order' };
        }
    };

    // Product filtering and pagination
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentProductPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const goToProductPage = (productId) => {
        setCurrentPage('product');
        // In a real app, this would navigate to individual product page
    };

    // Context values
    const authContextValue = {
        currentUser,
        login,
        register,
        logout,
        updateProfile
    };

    const cartContextValue = {
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        cartTotal,
        cartItemCount,
        wishlist,
        toggleWishlist,
        orders,
        placeOrder,
        products,
        setProducts,
        orders,
        setOrders,
        users: [], // Not needed for basic functionality
        goToProductPage,
        currentProductPage,
        setCurrentProductPage,
        totalPages,
        paginatedProducts
    };

    if (loading) {
        return createElement('div', {
            className: "min-h-screen bg-gray-50 flex items-center justify-center"
        }, createElement('div', {
            className: "text-center"
        }, [
            createElement('div', {
                key: 'spinner',
                className: "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"
            }),
            createElement('p', {
                key: 'loading-text',
                className: "mt-4 text-gray-600"
            }, 'Loading...')
        ]));
    }

    return createElement(AuthProvider, {
        value: authContextValue
    }, createElement(CartProvider, {
        value: cartContextValue
    }, createElement('div', {
        className: "min-h-screen bg-gray-50"
    }, [
        createElement(Navigation, {
            key: 'navigation',
            currentPage,
            setCurrentPage,
            searchQuery,
            setSearchQuery,
            isMobile
        }),
        
        createElement('main', {
            key: 'main',
            className: "pt-16"
        }, [
            currentPage === 'home' && createElement(HomePage, {
                key: 'home',
                products: filteredProducts.slice(0, 6), // Featured products
                selectedCategory,
                setSelectedCategory,
                setCurrentPage
            }),
            currentPage === 'products' && createElement(ProductsPage, {
                key: 'products',
                products: paginatedProducts,
                selectedCategory,
                setSelectedCategory,
                allProducts: products,
                currentPage: currentProductPage,
                setCurrentPage: setCurrentProductPage,
                totalPages
            }),
            currentPage === 'cart' && createElement(CartPage, {
                key: 'cart'
            }),
            currentPage === 'login' && createElement(LoginPage, {
                key: 'login',
                setCurrentPage
            }),
            currentPage === 'register' && createElement(RegisterPage, {
                key: 'register',
                setCurrentPage
            }),
            currentPage === 'account' && createElement(AccountPage, {
                key: 'account'
            }),
            currentPage === 'admin' && createElement(AdminDashboard, {
                key: 'admin'
            })
        ])
    ])));
};

export default ECommerceApp;
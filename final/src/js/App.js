// js/App.js
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
import { mockProducts, mockUsers, mockOrders, getStoredData, setStoredData } from './data/mockData';
import apiService from './services/api';

const ECommerceApp = () => {
    
    const [currentUser, setCurrentUser] = useState(() => getStoredData('currentUser', null));
    const [currentPage, setCurrentPage] = useState('home');
    const [products, setProducts] = useState(() => {
        const storedProducts = getStoredData('products', []);
        return Array.isArray(storedProducts) && storedProducts.length > 0 ? storedProducts : mockProducts;
    });

    // Load products from API on app start
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await apiService.getProducts();
                if (response.success) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error('Failed to load products:', error);
                // Fallback to mock data
                setProducts(mockProducts);
            }
        };
        
        loadProducts();
    }, []);

    // Save products to localStorage when they change
    useEffect(() => {
        setStoredData('products', products);
    }, [products]);
    const [users, setUsers] = useState(() => {
        const storedUsers = getStoredData('users', mockUsers);
        return Array.isArray(storedUsers) ? storedUsers : mockUsers;
    });
    const [orders, setOrders] = useState(() => {
        const storedOrders = getStoredData('orders', mockOrders);
        return Array.isArray(storedOrders) ? storedOrders : mockOrders;
    });
    const [cart, setCart] = useState(() => {
        const storedCart = getStoredData('cart', []);
        return Array.isArray(storedCart) ? storedCart : [];
    });
    const [wishlist, setWishlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const [productsPerPage] = useState(12);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load user-specific wishlist when user changes
    useEffect(() => {
        if (currentUser) {
            const userWishlistKey = `wishlist_${currentUser.id}`;
            const userWishlist = getStoredData(userWishlistKey, []);
            setWishlist(userWishlist);
        } else {
            setWishlist([]);
        }
    }, [currentUser]);

    useEffect(() => { setStoredData('cart', cart); }, [cart]);
    useEffect(() => { setStoredData('orders', orders); }, [orders]);

    const login = async (email, password) => {
        try {
            const response = await apiService.login(email, password);
            if (response.success) {
                setCurrentUser(response.data.user);
                setStoredData('currentUser', response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message || 'Invalid credentials' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const register = (userData) => {
        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
            return { success: false, error: 'Email already exists' };
        }
        const newUser = { 
            ...userData, 
            id: Date.now(), 
            role: 'customer',
            wishlist: [] // User-specific wishlist
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setStoredData('users', updatedUsers);
        setCurrentUser(newUser);
        setStoredData('currentUser', newUser);
        return { success: true };
    };

    const updateProfile = (profileData) => {
        const updatedUser = { ...currentUser, ...profileData };
        setCurrentUser(updatedUser);
        setStoredData('currentUser', updatedUser);
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        setStoredData('users', updatedUsers);
    };

    const logout = () => {
        setCurrentUser(null);
        setStoredData('currentUser', null);
        setCurrentPage('home');
        setCart([]);
        setWishlist([]);
    };

    const addToCart = (product, quantity = 1) => {
        if (!currentUser) {
            setCurrentPage('login');
            return;
        }
        
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const updateCartQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item => 
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const toggleWishlist = (product) => {
        if (!currentUser) {
            setCurrentPage('login');
            return;
        }
        
        // Update user-specific wishlist
        const userWishlistKey = `wishlist_${currentUser.id}`;
        const userWishlist = getStoredData(userWishlistKey, []);
        
        const exists = userWishlist.find(item => item.id === product.id);
        let updatedWishlist;
        
        if (exists) {
            updatedWishlist = userWishlist.filter(item => item.id !== product.id);
        } else {
            updatedWishlist = [...userWishlist, product];
        }
        
        setWishlist(updatedWishlist);
        setStoredData(userWishlistKey, updatedWishlist);
    };

    const placeOrder = (orderData) => {
        if (!currentUser || cart.length === 0) return;
        
        const newOrder = {
            id: Date.now(),
            userId: currentUser.id,
            items: cart.map(item => ({ 
                productId: item.id, 
                name: item.name, 
                quantity: item.quantity, 
                price: item.price 
            })),
            total: orderData.total || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'processing',
            date: new Date().toISOString().split('T')[0],
            shippingAddress: orderData.shippingAddress || currentUser.address,
            paymentMethod: orderData.paymentMethod || 'Credit Card',
            orderNotes: orderData.orderNotes || ''
        };
        
        setOrders(prev => [...prev, newOrder]);
        setCart([]);
        setCurrentPage('account'); // Redirect to account page to see order
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentProductPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const goToProductPage = (productId) => {
        setCurrentProductId(productId);
        setCurrentPage('product');
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const authContextValue = { currentUser, login, register, logout, updateProfile };
    const cartContextValue = { 
        cart, addToCart, updateCartQuantity, removeFromCart, cartTotal, cartItemCount,
        wishlist, toggleWishlist, placeOrder, orders, users, products, setProducts, setOrders,
        goToProductPage, currentProductPage, setCurrentProductPage, totalPages, paginatedProducts
    };

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
                products: filteredProducts,
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
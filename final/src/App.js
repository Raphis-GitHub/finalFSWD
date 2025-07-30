// js/App.js

const ECommerceApp = () => {
    const { useState, useEffect } = React;
    
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');
    const [products, setProducts] = useState(mockProducts);
    const [users, setUsers] = useState(() => getStoredData('users', mockUsers));
    const [orders, setOrders] = useState(() => getStoredData('orders', mockOrders));
    const [cart, setCart] = useState(() => getStoredData('cart', []));
    const [wishlist, setWishlist] = useState(() => getStoredData('wishlist', []));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => { setStoredData('cart', cart); }, [cart]);
    useEffect(() => { setStoredData('orders', orders); }, [orders]);
    useEffect(() => { setStoredData('wishlist', wishlist); }, [wishlist]);

    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const register = (userData) => {
        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
            return { success: false, error: 'Email already exists' };
        }
        const newUser = { ...userData, id: Date.now(), role: 'customer' };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setStoredData('users', updatedUsers);
        setCurrentUser(newUser);
        return { success: true };
    };

    const logout = () => {
        setCurrentUser(null);
        setCurrentPage('home');
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
        
        setWishlist(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                return prev.filter(item => item.id !== product.id);
            }
            return [...prev, product];
        });
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
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'processing',
            date: new Date().toISOString().split('T')[0],
            shippingAddress: orderData.address || currentUser.address
        };
        
        setOrders(prev => [...prev, newOrder]);
        setCart([]);
        setCurrentPage('orders');
    };

    const updateOrderStatus = (orderId, status) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status } : order
        ));
    };

    const addProduct = (productData) => {
        const newProduct = { ...productData, id: Date.now() };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (productId, productData) => {
        setProducts(prev => prev.map(product => 
            product.id === productId ? { ...product, ...productData } : product
        ));
    };

    const deleteProduct = (productId) => {
        setProducts(prev => prev.filter(product => product.id !== productId));
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const authContextValue = { currentUser, login, register, logout };
    const cartContextValue = { 
        cart, addToCart, updateCartQuantity, removeFromCart, cartTotal, cartItemCount,
        wishlist, toggleWishlist, placeOrder
    };

    return React.createElement(AuthProvider, {
        value: authContextValue
    }, React.createElement(CartProvider, {
        value: cartContextValue
    }, React.createElement('div', {
        className: "min-h-screen bg-gray-50"
    }, [
        React.createElement(Navigation, {
            key: 'navigation',
            currentPage,
            setCurrentPage,
            searchQuery,
            setSearchQuery,
            isMobile
        }),
        
        React.createElement('main', {
            key: 'main',
            className: "pt-16"
        }, [
            currentPage === 'home' && React.createElement(HomePage, {
                key: 'home',
                products: filteredProducts,
                selectedCategory,
                setSelectedCategory,
                setCurrentPage
            }),
            currentPage === 'products' && React.createElement(ProductsPage, {
                key: 'products',
                products: filteredProducts,
                selectedCategory,
                setSelectedCategory
            }),
            currentPage === 'cart' && React.createElement(CartPage, {
                key: 'cart'
            }),
            currentPage === 'wishlist' && React.createElement(WishlistPage, {
                key: 'wishlist'
            }),
            currentPage === 'orders' && React.createElement(OrdersPage, {
                key: 'orders'
            }),
            currentPage === 'profile' && React.createElement(ProfilePage, {
                key: 'profile'
            }),
            currentPage === 'register' && React.createElement(RegisterPage, {
                key: 'register',
                setCurrentPage
            }),
            currentPage === 'login' && React.createElement(LoginPage, {
                key: 'login',
                setCurrentPage
            }),
            currentPage === 'admin' && currentUser?.role === 'admin' && React.createElement(AdminDashboard, {
                key: 'admin',
                products,
                orders,
                users,
                addProduct,
                updateProduct,
                deleteProduct,
                updateOrderStatus
            })
        ])
    ])));
};

// Render the app
ReactDOM.render(React.createElement(ECommerceApp), document.getElementById('root'));
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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const authContextValue = { currentUser, login, logout };
    const cartContextValue = { 
        cart, addToCart, updateCartQuantity, removeFromCart, cartTotal, cartItemCount,
        wishlist, toggleWishlist
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
            currentPage === 'login' && React.createElement(LoginPage, {
                key: 'login',
                setCurrentPage
            })
        ])
    ])));
};

// Render the app
ReactDOM.render(React.createElement(ECommerceApp), document.getElementById('root'));
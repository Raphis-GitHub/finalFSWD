// js/pages/AdminDashboard.js

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const { products, setProducts, orders, setOrders, users } = useCart();
    const [activeTab, setActiveTab] = React.useState('overview');
    const [showAddProduct, setShowAddProduct] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'orders', label: 'Orders', icon: '🛒' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
    ];

    if (!currentUser || currentUser.role !== 'admin') {
        return React.createElement('div', {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }, React.createElement('div', {
            className: "text-center py-12"
        }, React.createElement('h2', {
            className: "text-2xl font-bold text-gray-900 mb-4"
        }, 'Access Denied - Admin Only')));
    }

    // Statistics calculations
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const pendingOrders = orders.filter(o => o.status === 'processing').length;

    // Filter functions
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchTerm) || 
                             order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addProduct = (productData) => {
        const newProduct = { 
            ...productData, 
            id: Date.now(),
            rating: parseFloat(productData.rating) || 4.0
        };
        setProducts(prev => [...prev, newProduct]);
        setShowAddProduct(false);
    };

    const updateProduct = (productId, productData) => {
        setProducts(prev => prev.map(product => 
            product.id === productId ? { ...product, ...productData } : product
        ));
        setEditingProduct(null);
    };

    const deleteProduct = (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(product => product.id !== productId));
        }
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'text-green-600 bg-green-100';
            case 'processing': return 'text-blue-600 bg-blue-100';
            case 'shipped': return 'text-purple-600 bg-purple-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const ProductForm = ({ product, onSubmit, onCancel }) => {
        const [formData, setFormData] = React.useState({
            name: product?.name || '',
            description: product?.description || '',
            price: product?.price || '',
            category: product?.category || 'Electronics',
            stock: product?.stock || '',
            image: product?.image || 'https://via.placeholder.com/300x300'
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit({
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            });
        };

        return React.createElement('div', {
            className: "bg-white rounded-lg shadow-md p-6 mb-6"
        }, [
            React.createElement('h3', {
                key: 'form-title',
                className: "text-lg font-semibold text-gray-900 mb-4"
            }, product ? 'Edit Product' : 'Add New Product'),
            
            React.createElement('form', {
                key: 'product-form',
                onSubmit: handleSubmit,
                className: "grid grid-cols-1 md:grid-cols-2 gap-4"
            }, [
                React.createElement('div', {
                    key: 'name-field'
                }, [
                    React.createElement('label', {
                        key: 'name-label',
                        className: "block text-sm font-medium text-gray-700 mb-2"
                    }, 'Product Name'),
                    React.createElement('input', {
                        key: 'name-input',
                        type: "text",
                        value: formData.name,
                        onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })),
                        className: "w-full p-3 border border-gray-300 rounded-md",
                        required: true
                    })
                ]),
                React.createElement('div', {
                    key: 'category-field'
                }, [
                    React.createElement('label', {
                        key: 'category-label',
                        className: "block text-sm font-medium text-gray-700 mb-2"
                    }, 'Category'),
                    React.createElement('select', {
                        key: 'category-select',
                        value: formData.category,
                        onChange: (e) => setFormData(prev => ({ ...prev, category: e.target.value })),
                        className: "w-full p-3 border border-gray-300 rounded-md"
                    }, [
                        React.createElement('option', { key: 'electronics', value: "Electronics" }, 'Electronics'),
                        React.createElement('option', { key: 'home', value: "Home" }, 'Home'),
                        React.createElement('option', { key: 'sports', value: "Sports" }, 'Sports'),
                        React.createElement('option', { key: 'fashion', value: "Fashion" }, 'Fashion'),
                        React.createElement('option', { key: 'books', value: "Books" }, 'Books')
                    ])
                ]),
                React.createElement('div', {
                    key: 'price-field'
                }, [
                    React.createElement('label', {
                        key: 'price-label',
                        className: "block text-sm font-medium text-gray-700 mb-2"
                    }, 'Price ($)'),
                    React.createElement('input', {
                        key: 'price-input',
                        type: "number",
                        step: "0.01",
                        min: "0",
                        value: formData.price,
                        onChange: (e) => setFormData(prev => ({ ...prev, price: e.target.value })),
                        className: "w-full p-3 border border-gray-300 rounded-md",
                        required: true
                    })
                ]),
                React.createElement('div', {
                    key: 'stock-field'
                }, [
                    React.createElement('label', {
                        key: 'stock-label',
                        className: "block text-sm font-medium text-gray-700 mb-2"
                    }, 'Stock Quantity'),
                    React.createElement('input', {
                        key: 'stock-input',
                        type: "number",
                        min: "0",
                        value: formData.stock,
                        onChange: (e) => setFormData(prev => ({ ...prev, stock: e.target.value })),
                        className: "w-full p-3 border border-gray-300 rounded-md",
                        required: true
                    })
                ]),
                React.createElement('div', {
                    key: 'image-field',
                    className: "md:col-span-2"
                }, [
                    React.createElement('label', {
                        key: 'image-label',
                        className: "block text-sm font-medium text-gray-700 mb-2"
                    }, 'Image URL'),
                    React.createElement('input', {
                        key: 'image-input',
                        type: "url",
                        value: formData.image,
                        onChange: (e) => setFormData(prev => ({ ...prev, image: e.target.value })),
                        className: "w-full p-3 border border-gray-300 rounded-md"
                    })
                ]),
                React.createElement('div', {
                    key: 'description-field',
                    className: "md:col-span-2"
                }, [
                    React.createElement('label', {
                        key: 'description-label',
                        className: "block text-sm font-medium text-gray-700 mb-2"
                    }, 'Description'),
                    React.createElement('textarea', {
                        key: 'description-input',
                        value: formData.description,
                        onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })),
                        className: "w-full p-3 border border-gray-300 rounded-md",
                        rows: "3",
                        required: true
                    })
                ]),
                React.createElement('div', {
                    key: 'form-actions',
                    className: "md:col-span-2 flex space-x-4"
                }, [
                    React.createElement('button', {
                        key: 'cancel-btn',
                        type: "button",
                        onClick: onCancel,
                        className: "flex-1 bg-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-400 transition-colors"
                    }, 'Cancel'),
                    React.createElement('button', {
                        key: 'submit-btn',
                        type: "submit",
                        className: "flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
                    }, product ? 'Update Product' : 'Add Product')
                ])
            ])
        ]);
    };

    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('div', {
            key: 'admin-header',
            className: "mb-8"
        }, [
            React.createElement('h1', {
                key: 'admin-title',
                className: "text-3xl font-bold text-gray-900"
            }, 'Admin Dashboard'),
            React.createElement('p', {
                key: 'admin-subtitle',
                className: "text-gray-600 mt-2"
            }, 'Manage your e-commerce platform')
        ]),
        
        React.createElement('div', {
            key: 'admin-tabs',
            className: "border-b border-gray-200 mb-8"
        }, React.createElement('nav', {
            className: "-mb-px flex space-x-8 overflow-x-auto"
        }, tabs.map(tab => React.createElement('button', {
            key: tab.id,
            onClick: () => setActiveTab(tab.id),
            className: `py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
        }, [
            React.createElement('span', {
                key: 'tab-icon',
                className: "mr-2"
            }, tab.icon),
            tab.label
        ])))),

        // Overview Tab
        activeTab === 'overview' && React.createElement('div', {
            key: 'overview-content'
        }, [
            React.createElement('div', {
                key: 'stats-grid',
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            }, [
                React.createElement('div', {
                    key: 'revenue-card',
                    className: "bg-white p-6 rounded-lg shadow-md"
                }, [
                    React.createElement('h3', {
                        key: 'revenue-title',
                        className: "text-lg font-semibold text-gray-900"
                    }, 'Total Revenue'),
                    React.createElement('p', {
                        key: 'revenue-amount',
                        className: "text-3xl font-bold text-green-600 mt-2"
                    }, `$${totalRevenue.toFixed(2)}`)
                ]),
                React.createElement('div', {
                    key: 'orders-card',
                    className: "bg-white p-6 rounded-lg shadow-md"
                }, [
                    React.createElement('h3', {
                        key: 'orders-title',
                        className: "text-lg font-semibold text-gray-900"
                    }, 'Total Orders'),
                    React.createElement('p', {
                        key: 'orders-count',
                        className: "text-3xl font-bold text-blue-600 mt-2"
                    }, totalOrders),
                    React.createElement('p', {
                        key: 'pending-orders',
                        className: "text-sm text-gray-600 mt-1"
                    }, `${pendingOrders} pending`)
                ]),
                React.createElement('div', {
                    key: 'products-card',
                    className: "bg-white p-6 rounded-lg shadow-md"
                }, [
                    React.createElement('h3', {
                        key: 'products-title',
                        className: "text-lg font-semibold text-gray-900"
                    }, 'Total Products'),
                    React.createElement('p', {
                        key: 'products-count',
                        className: "text-3xl font-bold text-purple-600 mt-2"
                    }, totalProducts),
                    React.createElement('p', {
                        key: 'low-stock',
                        className: "text-sm text-gray-600 mt-1"
                    }, `${lowStockProducts} low stock`)
                ]),
                React.createElement('div', {
                    key: 'users-card',
                    className: "bg-white p-6 rounded-lg shadow-md"
                }, [
                    React.createElement('h3', {
                        key: 'users-title',
                        className: "text-lg font-semibold text-gray-900"
                    }, 'Total Users'),
                    React.createElement('p', {
                        key: 'users-count',
                        className: "text-3xl font-bold text-orange-600 mt-2"
                    }, totalUsers)
                ])
            ]),

            // Quick Actions
            React.createElement('div', {
                key: 'quick-actions',
                className: "bg-white rounded-lg shadow-md p-6"
            }, [
                React.createElement('h3', {
                    key: 'actions-title',
                    className: "text-lg font-semibold text-gray-900 mb-4"
                }, 'Quick Actions'),
                React.createElement('div', {
                    key: 'actions-grid',
                    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
                }, [
                    React.createElement('button', {
                        key: 'add-product-action',
                        onClick: () => { setActiveTab('products'); setShowAddProduct(true); },
                        className: "p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    }, [
                        React.createElement('div', {
                            key: 'add-product-icon',
                            className: "text-2xl mb-2"
                        }, '➕'),
                        React.createElement('p', {
                            key: 'add-product-text',
                            className: "font-medium"
                        }, 'Add New Product')
                    ]),
                    React.createElement('button', {
                        key: 'view-orders-action',
                        onClick: () => setActiveTab('orders'),
                        className: "p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    }, [
                        React.createElement('div', {
                            key: 'view-orders-icon',
                            className: "text-2xl mb-2"
                        }, '📋'),
                        React.createElement('p', {
                            key: 'view-orders-text',
                            className: "font-medium"
                        }, 'Manage Orders')
                    ]),
                    React.createElement('button', {
                        key: 'view-analytics-action',
                        onClick: () => setActiveTab('analytics'),
                        className: "p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    }, [
                        React.createElement('div', {
                            key: 'view-analytics-icon',
                            className: "text-2xl mb-2"
                        }, '📊'),
                        React.createElement('p', {
                            key: 'view-analytics-text',
                            className: "font-medium"
                        }, 'View Analytics')
                    ])
                ])
            ])
        ]),

        // Products Tab
        activeTab === 'products' && React.createElement('div', {
            key: 'products-content'
        }, [
            React.createElement('div', {
                key: 'products-header',
                className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
            }, [
                React.createElement('h2', {
                    key: 'products-title',
                    className: "text-2xl font-bold text-gray-900"
                }, 'Product Management'),
                React.createElement('div', {
                    key: 'products-controls',
                    className: "flex flex-col sm:flex-row gap-4"
                }, [
                    React.createElement('input', {
                        key: 'search-input',
                        type: "text",
                        placeholder: "Search products...",
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value),
                        className: "px-4 py-2 border border-gray-300 rounded-md"
                    }),
                    React.createElement('button', {
                        key: 'add-product-btn',
                        onClick: () => setShowAddProduct(true),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    }, '+ Add Product')
                ])
            ]),

            showAddProduct && React.createElement(ProductForm, {
                key: 'add-form',
                onSubmit: addProduct,
                onCancel: () => setShowAddProduct(false)
            }),

            editingProduct && React.createElement(ProductForm, {
                key: 'edit-form',
                product: editingProduct,
                onSubmit: (data) => updateProduct(editingProduct.id, data),
                onCancel: () => setEditingProduct(null)
            }),

            React.createElement('div', {
                key: 'products-table',
                className: "bg-white rounded-lg shadow-md overflow-hidden"
            }, React.createElement('div', {
                className: "overflow-x-auto"
            }, React.createElement('table', {
                className: "min-w-full divide-y divide-gray-200"
            }, [
                React.createElement('thead', {
                    key: 'table-head',
                    className: "bg-gray-50"
                }, React.createElement('tr', {}, [
                    React.createElement('th', {
                        key: 'product-header',
                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    }, 'Product'),
                    React.createElement('th', {
                        key: 'category-header',
                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    }, 'Category'),
                    React.createElement('th', {
                        key: 'price-header',
                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    }, 'Price'),
                    React.createElement('th', {
                        key: 'stock-header',
                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    }, 'Stock'),
                    React.createElement('th', {
                        key: 'actions-header',
                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    }, 'Actions')
                ])),
                React.createElement('tbody', {
                    key: 'table-body',
                    className: "bg-white divide-y divide-gray-200"
                }, filteredProducts.map(product => React.createElement('tr', {
                    key: product.id
                }, [
                    React.createElement('td', {
                        key: 'product-cell',
                        className: "px-6 py-4 whitespace-nowrap"
                    }, React.createElement('div', {
                        className: "flex items-center"
                    }, [
                        React.createElement('img', {
                            key: 'product-image',
                            src: product.image,
                            alt: product.name,
                            className: "w-10 h-10 rounded-md object-cover mr-4"
                        }),
                        React.createElement('div', {
                            key: 'product-info'
                        }, [
                            React.createElement('div', {
                                key: 'product-name',
                                className: "text-sm font-medium text-gray-900"
                            }, product.name),
                            React.createElement('div', {
                                key: 'product-desc',
                                className: "text-sm text-gray-500 truncate max-w-xs"
                            }, product.description)
                        ])
                    ])),
                    React.createElement('td', {
                        key: 'category-cell',
                        className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    }, product.category),
                    React.createElement('td', {
                        key: 'price-cell',
                        className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    }, `$${product.price}`),
                    React.createElement('td', {
                        key: 'stock-cell',
                        className: `px-6 py-4 whitespace-nowrap text-sm ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-gray-900'}`
                    }, product.stock),
                    React.createElement('td', {
                        key: 'actions-cell',
                        className: "px-6 py-4 whitespace-nowrap text-sm font-medium"
                    }, React.createElement('div', {
                        className: "flex space-x-2"
                    }, [
                        React.createElement('button', {
                            key: 'edit-btn',
                            onClick: () => setEditingProduct(product),
                            className: "text-blue-600 hover:text-blue-900"
                        }, 'Edit'),
                        React.createElement('button', {
                            key: 'delete-btn',
                            onClick: () => deleteProduct(product.id),
                            className: "text-red-600 hover:text-red-900"
                        }, 'Delete')
                    ]))
                ])))
            ])))
        ]),

        // Orders Tab
        activeTab === 'orders' && React.createElement('div', {
            key: 'orders-content'
        }, [
            React.createElement('div', {
                key: 'orders-header',
                className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
            }, [
                React.createElement('h2', {
                    key: 'orders-title',
                    className: "text-2xl font-bold text-gray-900"
                }, 'Order Management'),
                React.createElement('div', {
                    key: 'orders-controls',
                    className: "flex flex-col sm:flex-row gap-4"
                }, [
                    React.createElement('input', {
                        key: 'search-orders',
                        type: "text",
                        placeholder: "Search orders...",
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value),
                        className: "px-4 py-2 border border-gray-300 rounded-md"
                    }),
                    React.createElement('select', {
                        key: 'filter-status',
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        className: "px-4 py-2 border border-gray-300 rounded-md"
                    }, [
                        React.createElement('option', { key: 'all', value: "all" }, 'All Orders'),
                        React.createElement('option', { key: 'processing', value: "processing" }, 'Processing'),
                        React.createElement('option', { key: 'shipped', value: "shipped" }, 'Shipped'),
                        React.createElement('option', { key: 'delivered', value: "delivered" }, 'Delivered'),
                        React.createElement('option', { key: 'cancelled', value: "cancelled" }, 'Cancelled')
                    ])
                ])
            ]),

            filteredOrders.length === 0 ? React.createElement('div', {
                key: 'no-orders',
                className: "text-center py-8"
            }, React.createElement('p', {
                className: "text-gray-600"
            }, 'No orders found.')) : React.createElement('div', {
                key: 'orders-list',
                className: "space-y-4"
            }, filteredOrders.map(order => React.createElement('div', {
                key: order.id,
                className: "bg-white rounded-lg shadow-md p-6"
            }, [
                React.createElement('div', {
                    key: 'order-header',
                    className: "flex justify-between items-start mb-4"
                }, [
                    React.createElement('div', {
                        key: 'order-info'
                    }, [
                        React.createElement('h3', {
                            key: 'order-id',
                            className: "font-semibold text-gray-900"
                        }, `Order #${order.id}`),
                        React.createElement('p', {
                            key: 'order-date',
                            className: "text-sm text-gray-600"
                        }, `Date: ${order.date}`)
                    ]),
                    React.createElement('div', {
                        key: 'order-status-control',
                        className: "flex items-center gap-4"
                    }, [
                        React.createElement('select', {
                            key: 'status-select',
                            value: order.status,
                            onChange: (e) => updateOrderStatus(order.id, e.target.value),
                            className: `px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.status)}`
                        }, [
                            React.createElement('option', { key: 'processing', value: "processing" }, 'Processing'),
                            React.createElement('option', { key: 'shipped', value: "shipped" }, 'Shipped'),
                            React.createElement('option', { key: 'delivered', value: "delivered" }, 'Delivered'),
                            React.createElement('option', { key: 'cancelled', value: "cancelled" }, 'Cancelled')
                        ])
                    ])
                ]),
                React.createElement('div', {
                    key: 'order-details',
                    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
                }, [
                    React.createElement('div', {
                        key: 'order-items'
                    }, [
                        React.createElement('h4', {
                            key: 'items-title',
                            className: "font-medium text-gray-900 mb-2"
                        }, 'Items:'),
                        React.createElement('ul', {
                            key: 'items-list',
                            className: "text-sm text-gray-600 space-y-1"
                        }, order.items.map((item, index) => React.createElement('li', {
                            key: index
                        }, `${item.name} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)))
                    ]),
                    React.createElement('div', {
                        key: 'order-summary'
                    }, [
                        React.createElement('p', {
                            key: 'shipping-address',
                            className: "text-sm text-gray-600 mb-2"
                        }, `Shipping: ${order.shippingAddress}`),
                        React.createElement('p', {
                            key: 'order-total',
                            className: "font-semibold text-lg"
                        }, `Total: $${order.total.toFixed(2)}`)
                    ])
                ])
            ])))
        ])
    ]);
};
// js/pages/AccountPage.js

const AccountPage = () => {
    const { currentUser, updateProfile } = useAuth();
    const { orders, wishlist, toggleWishlist } = useCart();
    const [activeTab, setActiveTab] = React.useState('profile');
    const [editMode, setEditMode] = React.useState(false);
    const [profileData, setProfileData] = React.useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        address: currentUser?.address || '',
        phone: currentUser?.phone || ''
    });
    const [passwordData, setPasswordData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const userOrders = orders.filter(order => order.userId === currentUser?.id) || [];

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
        { id: 'security', label: 'Security', icon: '🔒' }
    ];

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        try {
            updateProfile(profileData);
            setEditMode(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }
        
        // In a real app, you'd verify current password
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

    if (!currentUser) {
        return React.createElement('div', {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }, React.createElement('div', {
            className: "text-center py-12"
        }, React.createElement('h2', {
            className: "text-2xl font-bold text-gray-900 mb-4"
        }, 'Please log in to view your account')));
    }

    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('div', {
            key: 'page-header',
            className: "mb-8"
        }, [
            React.createElement('h1', {
                key: 'page-title',
                className: "text-3xl font-bold text-gray-900"
            }, 'My Account'),
            React.createElement('p', {
                key: 'page-subtitle',
                className: "text-gray-600 mt-2"
            }, `Welcome back, ${currentUser.name}!`)
        ]),

        message.text && React.createElement('div', {
            key: 'message',
            className: `mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`
        }, message.text),

        React.createElement('div', {
            key: 'account-content',
            className: "grid grid-cols-1 lg:grid-cols-4 gap-8"
        }, [
            // Sidebar Navigation
            React.createElement('div', {
                key: 'sidebar',
                className: "lg:col-span-1"
            }, React.createElement('div', {
                className: "bg-white rounded-lg shadow-md p-6"
            }, [
                React.createElement('h3', {
                    key: 'nav-title',
                    className: "text-lg font-semibold text-gray-900 mb-4"
                }, 'Account Settings'),
                React.createElement('nav', {
                    key: 'nav-items',
                    className: "space-y-2"
                }, tabs.map(tab => React.createElement('button', {
                    key: tab.id,
                    onClick: () => setActiveTab(tab.id),
                    className: `w-full text-left px-3 py-2 rounded-md transition-colors flex items-center ${
                        activeTab === tab.id 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                    }`
                }, [
                    React.createElement('span', {
                        key: 'tab-icon',
                        className: "mr-3"
                    }, tab.icon),
                    tab.label
                ])))
            ])),

            // Main Content
            React.createElement('div', {
                key: 'main-content',
                className: "lg:col-span-3"
            }, React.createElement('div', {
                className: "bg-white rounded-lg shadow-md p-6"
            }, [
                // Profile Tab
                activeTab === 'profile' && React.createElement('div', {
                    key: 'profile-content'
                }, [
                    React.createElement('div', {
                        key: 'profile-header',
                        className: "flex justify-between items-center mb-6"
                    }, [
                        React.createElement('h2', {
                            key: 'profile-title',
                            className: "text-xl font-semibold text-gray-900"
                        }, 'Profile Information'),
                        React.createElement('button', {
                            key: 'edit-btn',
                            onClick: () => setEditMode(!editMode),
                            className: `px-4 py-2 rounded-md transition-colors ${
                                editMode 
                                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`
                        }, editMode ? 'Cancel' : 'Edit Profile')
                    ]),

                    editMode ? React.createElement('form', {
                        key: 'profile-form',
                        onSubmit: handleProfileUpdate,
                        className: "space-y-4"
                    }, [
                        React.createElement('div', {
                            key: 'name-field',
                            className: "grid grid-cols-1 md:grid-cols-2 gap-4"
                        }, [
                            React.createElement('div', {
                                key: 'name-input'
                            }, [
                                React.createElement('label', {
                                    key: 'name-label',
                                    className: "block text-sm font-medium text-gray-700 mb-2"
                                }, 'Full Name'),
                                React.createElement('input', {
                                    key: 'name-field-input',
                                    type: "text",
                                    value: profileData.name,
                                    onChange: (e) => setProfileData(prev => ({ ...prev, name: e.target.value })),
                                    className: "w-full p-3 border border-gray-300 rounded-md"
                                })
                            ]),
                            React.createElement('div', {
                                key: 'email-input'
                            }, [
                                React.createElement('label', {
                                    key: 'email-label',
                                    className: "block text-sm font-medium text-gray-700 mb-2"
                                }, 'Email Address'),
                                React.createElement('input', {
                                    key: 'email-field-input',
                                    type: "email",
                                    value: profileData.email,
                                    onChange: (e) => setProfileData(prev => ({ ...prev, email: e.target.value })),
                                    className: "w-full p-3 border border-gray-300 rounded-md"
                                })
                            ])
                        ]),
                        React.createElement('div', {
                            key: 'address-field'
                        }, [
                            React.createElement('label', {
                                key: 'address-label',
                                className: "block text-sm font-medium text-gray-700 mb-2"
                            }, 'Address'),
                            React.createElement('input', {
                                key: 'address-input',
                                type: "text",
                                value: profileData.address,
                                onChange: (e) => setProfileData(prev => ({ ...prev, address: e.target.value })),
                                className: "w-full p-3 border border-gray-300 rounded-md"
                            })
                        ]),
                        React.createElement('div', {
                            key: 'phone-field'
                        }, [
                            React.createElement('label', {
                                key: 'phone-label',
                                className: "block text-sm font-medium text-gray-700 mb-2"
                            }, 'Phone Number'),
                            React.createElement('input', {
                                key: 'phone-input',
                                type: "tel",
                                value: profileData.phone,
                                onChange: (e) => setProfileData(prev => ({ ...prev, phone: e.target.value })),
                                className: "w-full p-3 border border-gray-300 rounded-md"
                            })
                        ]),
                        React.createElement('button', {
                            key: 'save-btn',
                            type: "submit",
                            className: "bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                        }, 'Save Changes')
                    ]) : React.createElement('div', {
                        key: 'profile-display',
                        className: "space-y-4"
                    }, [
                        React.createElement('div', {
                            key: 'display-name',
                            className: "grid grid-cols-1 md:grid-cols-2 gap-4"
                        }, [
                            React.createElement('div', {
                                key: 'name-display'
                            }, [
                                React.createElement('label', {
                                    key: 'name-display-label',
                                    className: "block text-sm font-medium text-gray-700 mb-1"
                                }, 'Full Name'),
                                React.createElement('p', {
                                    key: 'name-display-value',
                                    className: "text-gray-900"
                                }, currentUser.name)
                            ]),
                            React.createElement('div', {
                                key: 'email-display'
                            }, [
                                React.createElement('label', {
                                    key: 'email-display-label',
                                    className: "block text-sm font-medium text-gray-700 mb-1"
                                }, 'Email Address'),
                                React.createElement('p', {
                                    key: 'email-display-value',
                                    className: "text-gray-900"
                                }, currentUser.email)
                            ])
                        ]),
                        React.createElement('div', {
                            key: 'address-display'
                        }, [
                            React.createElement('label', {
                                key: 'address-display-label',
                                className: "block text-sm font-medium text-gray-700 mb-1"
                            }, 'Address'),
                            React.createElement('p', {
                                key: 'address-display-value',
                                className: "text-gray-900"
                            }, currentUser.address)
                        ]),
                        React.createElement('div', {
                            key: 'phone-display'
                        }, [
                            React.createElement('label', {
                                key: 'phone-display-label',
                                className: "block text-sm font-medium text-gray-700 mb-1"
                            }, 'Phone Number'),
                            React.createElement('p', {
                                key: 'phone-display-value',
                                className: "text-gray-900"
                            }, currentUser.phone)
                        ])
                    ])
                ]),

                // Orders Tab
                activeTab === 'orders' && React.createElement('div', {
                    key: 'orders-content'
                }, [
                    React.createElement('h2', {
                        key: 'orders-title',
                        className: "text-xl font-semibold text-gray-900 mb-6"
                    }, 'Order History'),
                    
                    userOrders.length === 0 ? React.createElement('div', {
                        key: 'no-orders',
                        className: "text-center py-8"
                    }, [
                        React.createElement('p', {
                            key: 'no-orders-text',
                            className: "text-gray-600 text-lg"
                        }, 'You haven\'t placed any orders yet.'),
                        React.createElement('button', {
                            key: 'shop-now-btn',
                            onClick: () => window.location.hash = '#products',
                            className: "mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                        }, 'Start Shopping')
                    ]) : React.createElement('div', {
                        key: 'orders-list',
                        className: "space-y-4"
                    }, userOrders.map(order => React.createElement('div', {
                        key: order.id,
                        className: "border border-gray-200 rounded-lg p-6"
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
                                }, `Placed on ${order.date}`)
                            ]),
                            React.createElement('span', {
                                key: 'order-status',
                                className: `px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`
                            }, order.status.charAt(0).toUpperCase() + order.status.slice(1))
                        ]),
                        React.createElement('div', {
                            key: 'order-items',
                            className: "mb-4"
                        }, [
                            React.createElement('h4', {
                                key: 'items-title',
                                className: "font-medium text-gray-900 mb-2"
                            }, 'Items:'),
                            React.createElement('ul', {
                                key: 'items-list',
                                className: "space-y-1"
                            }, order.items.map((item, index) => React.createElement('li', {
                                key: index,
                                className: "text-sm text-gray-600"
                            }, `${item.name} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)))
                        ]),
                        React.createElement('div', {
                            key: 'order-total',
                            className: "text-right"
                        }, React.createElement('p', {
                            className: "font-semibold text-lg"
                        }, `Total: $${order.total.toFixed(2)}`))
                    ])))
                ]),

                // Wishlist Tab
                activeTab === 'wishlist' && React.createElement('div', {
                    key: 'wishlist-content'
                }, [
                    React.createElement('h2', {
                        key: 'wishlist-title',
                        className: "text-xl font-semibold text-gray-900 mb-6"
                    }, 'My Wishlist'),
                    
                    wishlist.length === 0 ? React.createElement('div', {
                        key: 'no-wishlist',
                        className: "text-center py-8"
                    }, [
                        React.createElement('p', {
                            key: 'no-wishlist-text',
                            className: "text-gray-600 text-lg"
                        }, 'Your wishlist is empty.'),
                        React.createElement('button', {
                            key: 'browse-products-btn',
                            onClick: () => window.location.hash = '#products',
                            className: "mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                        }, 'Browse Products')
                    ]) : React.createElement('div', {
                        key: 'wishlist-grid',
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    }, wishlist.map(product => React.createElement('div', {
                        key: product.id,
                        className: "bg-white border rounded-lg p-4 shadow-sm"
                    }, [
                        React.createElement(LazyImage, {
                            key: 'product-image',
                            src: product.image,
                            alt: product.name,
                            className: "w-full h-40 object-cover rounded-md mb-3"
                        }),
                        React.createElement('h3', {
                            key: 'product-name',
                            className: "font-semibold text-gray-900 mb-2"
                        }, product.name),
                        React.createElement('p', {
                            key: 'product-price',
                            className: "text-lg font-bold text-blue-600 mb-3"
                        }, `$${product.price.toFixed(2)}`),
                        React.createElement('div', {
                            key: 'product-actions',
                            className: "flex space-x-2"
                        }, [
                            React.createElement('button', {
                                key: 'remove-btn',
                                onClick: () => toggleWishlist(product),
                                className: "flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            }, 'Remove'),
                            React.createElement('button', {
                                key: 'view-btn',
                                onClick: () => {
                                    // Will implement product page navigation later
                                    console.log('View product:', product.id);
                                },
                                className: "flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                            }, 'View')
                        ])
                    ])))
                ]),

                // Security Tab
                activeTab === 'security' && React.createElement('div', {
                    key: 'security-content'
                }, [
                    React.createElement('h2', {
                        key: 'security-title',
                        className: "text-xl font-semibold text-gray-900 mb-6"
                    }, 'Security Settings'),
                    
                    React.createElement('form', {
                        key: 'password-form',
                        onSubmit: handlePasswordChange,
                        className: "space-y-4 max-w-md"
                    }, [
                        React.createElement('div', {
                            key: 'current-password-field'
                        }, [
                            React.createElement('label', {
                                key: 'current-password-label',
                                className: "block text-sm font-medium text-gray-700 mb-2"
                            }, 'Current Password'),
                            React.createElement('input', {
                                key: 'current-password-input',
                                type: "password",
                                value: passwordData.currentPassword,
                                onChange: (e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value })),
                                className: "w-full p-3 border border-gray-300 rounded-md",
                                required: true
                            })
                        ]),
                        React.createElement('div', {
                            key: 'new-password-field'
                        }, [
                            React.createElement('label', {
                                key: 'new-password-label',
                                className: "block text-sm font-medium text-gray-700 mb-2"
                            }, 'New Password'),
                            React.createElement('input', {
                                key: 'new-password-input',
                                type: "password",
                                value: passwordData.newPassword,
                                onChange: (e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value })),
                                className: "w-full p-3 border border-gray-300 rounded-md",
                                required: true,
                                minLength: 6
                            })
                        ]),
                        React.createElement('div', {
                            key: 'confirm-password-field'
                        }, [
                            React.createElement('label', {
                                key: 'confirm-password-label',
                                className: "block text-sm font-medium text-gray-700 mb-2"
                            }, 'Confirm New Password'),
                            React.createElement('input', {
                                key: 'confirm-password-input',
                                type: "password",
                                value: passwordData.confirmPassword,
                                onChange: (e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value })),
                                className: "w-full p-3 border border-gray-300 rounded-md",
                                required: true
                            })
                        ]),
                        React.createElement('button', {
                            key: 'change-password-btn',
                            type: "submit",
                            className: "bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                        }, 'Change Password')
                    ])
                ])
            ]))
        ])
    ]);
};
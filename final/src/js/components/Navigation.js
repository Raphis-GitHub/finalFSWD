// js/components/Navigation.js

const Navigation = ({ currentPage, setCurrentPage, searchQuery, setSearchQuery, isMobile }) => {
    const { currentUser, logout } = useAuth();
    const { cartItemCount } = useCart();
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'products', label: 'Products' }
    ];

    return React.createElement('nav', {
        className: "fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
    }, React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    }, [
        React.createElement('div', {
            key: 'nav-container',
            className: "flex justify-between items-center h-16"
        }, [
            React.createElement('div', {
                key: 'logo',
                className: "flex items-center"
            }, React.createElement('button', {
                onClick: () => setCurrentPage('home'),
                className: "text-2xl font-bold text-blue-600"
            }, 'ShopHub')),

            !isMobile && React.createElement(React.Fragment, { key: 'desktop-nav' }, [
                React.createElement('div', {
                    key: 'nav-items',
                    className: "flex items-center space-x-8"
                }, navItems.map(item => React.createElement('button', {
                    key: item.id,
                    onClick: () => setCurrentPage(item.id),
                    className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                    }`
                }, item.label))),

                React.createElement('div', {
                    key: 'search-bar',
                    className: "flex-1 max-w-lg mx-8"
                }, React.createElement('div', {
                    className: "relative"
                }, [
                    React.createElement('div', {
                        key: 'search-icon',
                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    }, React.createElement(SearchIcon)),
                    React.createElement('input', {
                        key: 'search-input',
                        type: "text",
                        placeholder: "Search products...",
                        value: searchQuery,
                        onChange: (e) => setSearchQuery(e.target.value),
                        className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    })
                ])),

                React.createElement('div', {
                    key: 'user-actions',
                    className: "flex items-center space-x-4"
                }, currentUser ? [
                    React.createElement('button', {
                        key: 'cart-btn',
                        onClick: () => setCurrentPage('cart'),
                        className: `relative p-2 rounded-md transition-colors ${
                            currentPage === 'cart' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                        }`
                    }, [
                        React.createElement(CartIcon, {
                            key: 'cart-icon'
                        }),
                        cartItemCount > 0 && React.createElement('span', {
                            key: 'cart-badge',
                            className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        }, cartItemCount)
                    ]),
                    React.createElement('button', {
                        key: 'profile-btn',
                        onClick: () => setCurrentPage('profile'),
                        className: `p-2 rounded-md transition-colors ${
                            currentPage === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                        }`
                    }, React.createElement(UserIcon)),
                    React.createElement('button', {
                        key: 'logout-btn',
                        onClick: logout,
                        className: "p-2 text-gray-700 hover:text-red-600 rounded-md transition-colors",
                        title: "Logout"
                    }, React.createElement(LogoutIcon))
                ] : [
                    React.createElement('button', {
                        key: 'login-btn',
                        onClick: () => setCurrentPage('login'),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    }, 'Login')
                ])
            ]),

            isMobile && React.createElement('button', {
                key: 'mobile-menu-btn',
                onClick: () => setShowMobileMenu(!showMobileMenu),
                className: "p-2 rounded-md text-gray-700"
            }, React.createElement(showMobileMenu ? CloseIcon : MenuIcon))
        ])
    ]));
};
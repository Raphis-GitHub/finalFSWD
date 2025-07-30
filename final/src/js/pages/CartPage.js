// js/pages/CartPage.js

const CartPage = () => {
    const { cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder } = useCart();
    const { currentUser } = useAuth();
    const [showCheckout, setShowCheckout] = React.useState(false);

    if (!currentUser) {
        return React.createElement('div', {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }, React.createElement('div', {
            className: "text-center py-12"
        }, React.createElement('h2', {
            className: "text-2xl font-bold text-gray-900 mb-4"
        }, 'Please log in to view your cart')));
    }

    if (cart.length === 0) {
        return React.createElement('div', {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }, React.createElement('div', {
            className: "text-center py-12"
        }, [
            React.createElement('div', {
                key: 'empty-icon',
                className: "text-gray-400 mb-4 text-6xl"
            }, React.createElement(CartIcon)),
            React.createElement('h2', {
                key: 'empty-title',
                className: "text-2xl font-bold text-gray-900 mb-2"
            }, 'Your cart is empty'),
            React.createElement('p', {
                key: 'empty-desc',
                className: "text-gray-600"
            }, 'Add some products to get started!')
        ]));
    }

    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('h1', {
            key: 'cart-title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'Shopping Cart'),
        
        React.createElement('div', {
            key: 'cart-content',
            className: "grid grid-cols-1 lg:grid-cols-3 gap-8"
        }, [
            React.createElement('div', {
                key: 'cart-items',
                className: "lg:col-span-2"
            }, React.createElement('div', {
                className: "bg-white rounded-lg shadow-md"
            }, cart.map(item => React.createElement('div', {
                key: item.id,
                className: "p-6 border-b border-gray-200 last:border-b-0"
            }, React.createElement('div', {
                className: "flex items-center space-x-4"
            }, [
                React.createElement('img', {
                    key: 'item-image',
                    src: item.image,
                    alt: item.name,
                    className: "w-20 h-20 object-cover rounded-md"
                }),
                React.createElement('div', {
                    key: 'item-details',
                    className: "flex-1"
                }, [
                    React.createElement('h3', {
                        key: 'item-name',
                        className: "font-semibold text-gray-900"
                    }, item.name),
                    React.createElement('p', {
                        key: 'item-price',
                        className: "text-gray-600"
                    }, `$${item.price}`)
                ]),
                React.createElement('div', {
                    key: 'item-quantity',
                    className: "flex items-center space-x-2"
                }, [
                    React.createElement('button', {
                        key: 'decrease-btn',
                        onClick: () => updateCartQuantity(item.id, item.quantity - 1),
                        className: "w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                    }, '-'),
                    React.createElement('span', {
                        key: 'quantity',
                        className: "w-12 text-center"
                    }, item.quantity),
                    React.createElement('button', {
                        key: 'increase-btn',
                        onClick: () => updateCartQuantity(item.id, item.quantity + 1),
                        className: "w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                    }, '+')
                ]),
                React.createElement('div', {
                    key: 'item-actions',
                    className: "text-right"
                }, [
                    React.createElement('p', {
                        key: 'item-total',
                        className: "font-semibold"
                    }, `$${(item.price * item.quantity).toFixed(2)}`),
                    React.createElement('button', {
                        key: 'remove-btn',
                        onClick: () => removeFromCart(item.id),
                        className: "text-red-600 hover:text-red-800 text-sm mt-1"
                    }, 'Remove')
                ])
            ]))))),

            React.createElement('div', {
                key: 'order-summary',
                className: "lg:col-span-1"
            }, React.createElement('div', {
                className: "bg-white rounded-lg shadow-md p-6"
            }, [
                React.createElement('h3', {
                    key: 'summary-title',
                    className: "text-lg font-semibold text-gray-900 mb-4"
                }, 'Order Summary'),
                
                React.createElement('div', {
                    key: 'summary-details',
                    className: "space-y-3 mb-6"
                }, [
                    React.createElement('div', {
                        key: 'subtotal',
                        className: "flex justify-between"
                    }, [
                        React.createElement('span', { key: 'subtotal-label' }, 'Subtotal'),
                        React.createElement('span', { key: 'subtotal-value' }, `$${cartTotal.toFixed(2)}`)
                    ]),
                    React.createElement('div', {
                        key: 'shipping',
                        className: "flex justify-between"
                    }, [
                        React.createElement('span', { key: 'shipping-label' }, 'Shipping'),
                        React.createElement('span', { key: 'shipping-value' }, cartTotal > 50 ? 'Free' : '$9.99')
                    ]),
                    React.createElement('div', {
                        key: 'tax',
                        className: "flex justify-between"
                    }, [
                        React.createElement('span', { key: 'tax-label' }, 'Tax'),
                        React.createElement('span', { key: 'tax-value' }, `$${(cartTotal * 0.08).toFixed(2)}`)
                    ]),
                    React.createElement('div', {
                        key: 'total',
                        className: "border-t pt-3"
                    }, React.createElement('div', {
                        className: "flex justify-between font-semibold text-lg"
                    }, [
                        React.createElement('span', { key: 'total-label' }, 'Total'),
                        React.createElement('span', { key: 'total-value' }, 
                            `$${(cartTotal + (cartTotal > 50 ? 0 : 9.99) + cartTotal * 0.08).toFixed(2)}`
                        )
                    ]))
                ]),

                !showCheckout ? React.createElement('button', {
                    key: 'checkout-btn',
                    onClick: () => setShowCheckout(true),
                    className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
                }, 'Proceed to Checkout') : React.createElement(CheckoutForm, {
                    key: 'checkout-form',
                    onSubmit: placeOrder,
                    onCancel: () => setShowCheckout(false)
                })
            ]))
        ])
    ]);
};
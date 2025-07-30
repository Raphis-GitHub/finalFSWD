// js/pages/CartPage.js
import React, { useState, createElement } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CartIcon } from '../utils/icons';
import CheckoutForm from '../components/CheckoutForm';

const CartPage = () => {
    const { cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder } = useCart();
    const { currentUser } = useAuth();
    const [showCheckout, setShowCheckout] = useState(false);

    if (!currentUser) {
        return createElement('div', {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }, createElement('div', {
            className: "text-center py-12"
        }, createElement('h2', {
            className: "text-2xl font-bold text-gray-900 mb-4"
        }, 'Please log in to view your cart')));
    }

    if (cart.length === 0) {
        return createElement('div', {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }, createElement('div', {
            className: "text-center py-12"
        }, [
            createElement('div', {
                key: 'empty-icon',
                className: "text-gray-400 mb-4 text-6xl"
            }, createElement(CartIcon)),
            createElement('h2', {
                key: 'empty-title',
                className: "text-2xl font-bold text-gray-900 mb-2"
            }, 'Your cart is empty'),
            createElement('p', {
                key: 'empty-desc',
                className: "text-gray-600"
            }, 'Add some products to get started!')
        ]));
    }

    return createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        createElement('h1', {
            key: 'cart-title',
            className: "text-3xl font-bold text-gray-900 mb-8"
        }, 'Shopping Cart'),
        
        createElement('div', {
            key: 'cart-content',
            className: "grid grid-cols-1 lg:grid-cols-3 gap-8"
        }, [
            createElement('div', {
                key: 'cart-items',
                className: "lg:col-span-2"
            }, createElement('div', {
                className: "bg-white rounded-lg shadow-md"
            }, cart.map(item => createElement('div', {
                key: item.id,
                className: "p-6 border-b border-gray-200 last:border-b-0"
            }, createElement('div', {
                className: "flex items-center space-x-4"
            }, [
                createElement('img', {
                    key: 'item-image',
                    src: item.image,
                    alt: item.name,
                    className: "w-20 h-20 object-cover rounded-md"
                }),
                createElement('div', {
                    key: 'item-details',
                    className: "flex-1"
                }, [
                    createElement('h3', {
                        key: 'item-name',
                        className: "font-semibold text-gray-900"
                    }, item.name),
                    createElement('p', {
                        key: 'item-price',
                        className: "text-gray-600"
                    }, `$${item.price}`)
                ]),
                createElement('div', {
                    key: 'item-quantity',
                    className: "flex items-center space-x-2"
                }, [
                    createElement('button', {
                        key: 'decrease-btn',
                        onClick: () => updateCartQuantity(item.id, item.quantity - 1),
                        className: "w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                    }, '-'),
                    createElement('span', {
                        key: 'quantity',
                        className: "w-12 text-center"
                    }, item.quantity),
                    createElement('button', {
                        key: 'increase-btn',
                        onClick: () => updateCartQuantity(item.id, item.quantity + 1),
                        className: "w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                    }, '+')
                ]),
                createElement('div', {
                    key: 'item-actions',
                    className: "text-right"
                }, [
                    createElement('p', {
                        key: 'item-total',
                        className: "font-semibold"
                    }, `$${(item.price * item.quantity).toFixed(2)}`),
                    createElement('button', {
                        key: 'remove-btn',
                        onClick: () => removeFromCart(item.id),
                        className: "text-red-600 hover:text-red-800 text-sm mt-1"
                    }, 'Remove')
                ])
            ]))))),

            createElement('div', {
                key: 'order-summary',
                className: "lg:col-span-1"
            }, createElement('div', {
                className: "bg-white rounded-lg shadow-md p-6"
            }, [
                createElement('h3', {
                    key: 'summary-title',
                    className: "text-lg font-semibold text-gray-900 mb-4"
                }, 'Order Summary'),
                
                createElement('div', {
                    key: 'summary-details',
                    className: "space-y-3 mb-6"
                }, [
                    createElement('div', {
                        key: 'subtotal',
                        className: "flex justify-between"
                    }, [
                        createElement('span', { key: 'subtotal-label' }, 'Subtotal'),
                        createElement('span', { key: 'subtotal-value' }, `$${cartTotal.toFixed(2)}`)
                    ]),
                    createElement('div', {
                        key: 'shipping',
                        className: "flex justify-between"
                    }, [
                        createElement('span', { key: 'shipping-label' }, 'Shipping'),
                        createElement('span', { key: 'shipping-value' }, cartTotal > 50 ? 'Free' : '$9.99')
                    ]),
                    createElement('div', {
                        key: 'tax',
                        className: "flex justify-between"
                    }, [
                        createElement('span', { key: 'tax-label' }, 'Tax'),
                        createElement('span', { key: 'tax-value' }, `$${(cartTotal * 0.08).toFixed(2)}`)
                    ]),
                    createElement('div', {
                        key: 'total',
                        className: "border-t pt-3"
                    }, createElement('div', {
                        className: "flex justify-between font-semibold text-lg"
                    }, [
                        createElement('span', { key: 'total-label' }, 'Total'),
                        createElement('span', { key: 'total-value' }, 
                            `$${(cartTotal + (cartTotal > 50 ? 0 : 9.99) + cartTotal * 0.08).toFixed(2)}`
                        )
                    ]))
                ]),

                !showCheckout ? createElement('button', {
                    key: 'checkout-btn',
                    onClick: () => setShowCheckout(true),
                    className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
                }, 'Proceed to Checkout') : createElement(CheckoutForm, {
                    key: 'checkout-form',
                    onSubmit: placeOrder,
                    onCancel: () => setShowCheckout(false)
                })
            ]))
        ])
    ]);
};

export default CartPage;
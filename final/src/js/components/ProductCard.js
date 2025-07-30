// js/components/ProductCard.js
import React, { createElement } from 'react';
import { useCart } from '../contexts/CartContext';
import { HeartIcon, StarIcon } from '../utils/icons';

const ProductCard = ({ product }) => {
    const { addToCart, wishlist, toggleWishlist, goToProductPage } = useCart();
    const isInWishlist = wishlist.some(item => item.id === product.id);

    return createElement('div', {
        className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    }, [
        createElement('div', {
            key: 'image-container',
            className: "relative"
        }, [
            createElement(LazyImage, {
                key: 'product-image',
                src: product.image,
                alt: product.name,
                className: "w-full h-48 object-cover"
            }),
            createElement('button', {
                key: 'wishlist-btn',
                onClick: () => toggleWishlist(product),
                className: `absolute top-2 right-2 p-2 rounded-full transition-colors ${
                    isInWishlist ? 'bg-red-100' : 'bg-white hover:bg-red-50'
                }`
            }, createElement(HeartIcon, {
                filled: isInWishlist,
                className: "text-red-500"
            })),
            product.stock < 10 && createElement('div', {
                key: 'stock-warning',
                className: "absolute top-2 left-2 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium"
            }, `Only ${product.stock} left`)
        ]),
        
        createElement('div', {
            key: 'product-details',
            className: "p-4"
        }, [
            createElement('div', {
                key: 'category-rating',
                className: "flex items-center justify-between mb-2"
            }, [
                createElement('span', {
                    key: 'category',
                    className: "text-sm text-gray-500"
                }, product.category),
                createElement('div', {
                    key: 'rating',
                    className: "flex items-center"
                }, [
                    createElement(StarIcon, {
                        key: 'star',
                        className: "text-yellow-400"
                    }),
                    createElement('span', {
                        key: 'rating-text',
                        className: "text-sm text-gray-600 ml-1"
                    }, product.rating)
                ])
            ]),
            createElement('button', {
                key: 'product-name',
                onClick: () => goToProductPage(product.id),
                className: "font-semibold text-gray-900 mb-2 text-left hover:text-blue-600 transition-colors cursor-pointer"
            }, product.name),
            createElement('p', {
                key: 'product-description',
                className: "text-sm text-gray-600 mb-3"
            }, product.description),
            createElement('div', {
                key: 'price-action',
                className: "flex items-center justify-between"
            }, [
                createElement('button', {
                    key: 'view-details',
                    onClick: () => goToProductPage(product.id),
                    className: "text-sm text-blue-600 hover:text-blue-800 mr-2"
                }, 'View Details'),
                createElement('div', {
                    key: 'price-cart',
                    className: "flex items-center space-x-2"
                }, [
                    createElement('span', {
                        key: 'price',
                        className: "text-xl font-bold text-gray-900"
                    }, `$${product.price}`),
                    createElement('button', {
                        key: 'add-to-cart',
                        onClick: () => addToCart(product),
                        disabled: product.stock === 0,
                        className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            product.stock > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`
                    }, product.stock > 0 ? 'Add to Cart' : 'Out of Stock')
                ])
            ])
        ])
    ]);
};

export default ProductCard;
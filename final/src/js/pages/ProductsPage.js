// js/pages/ProductsPage.js

const ProductsPage = ({ products, selectedCategory, setSelectedCategory }) => {
    const categories = ['all', ...new Set(products.map(p => p.category))];

    return React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    }, [
        React.createElement('div', {
            key: 'page-header',
            className: "mb-8"
        }, [
            React.createElement('h1', {
                key: 'page-title',
                className: "text-3xl font-bold text-gray-900 mb-4"
            }, 'All Products'),
            React.createElement('div', {
                key: 'filters',
                className: "flex flex-wrap gap-2"
            }, categories.map(category => React.createElement('button', {
                key: category,
                onClick: () => setSelectedCategory(category),
                className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`
            }, category === 'all' ? 'All Categories' : category)))
        ]),
        React.createElement('div', {
            key: 'products-grid',
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        }, products.map(product => React.createElement(ProductCard, {
            key: product.id,
            product: product
        })))
    ]);
};
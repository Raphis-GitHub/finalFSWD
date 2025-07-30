// js/pages/ProductsPage.js

const ProductsPage = ({ products, selectedCategory, setSelectedCategory, allProducts, currentPage, setCurrentPage, totalPages }) => {
    const categories = ['all', ...new Set(allProducts.map(p => p.category))];

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        }))),
        
        // Pagination
        totalPages > 1 && React.createElement('div', {
            key: 'pagination',
            className: "flex justify-center items-center mt-12 space-x-2"
        }, [
            React.createElement('button', {
                key: 'prev-btn',
                onClick: () => handlePageChange(currentPage - 1),
                disabled: currentPage === 1,
                className: `px-4 py-2 rounded-md ${
                    currentPage === 1 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`
            }, 'Previous'),
            
            ...Array.from({ length: totalPages }, (_, i) => i + 1).map(page => 
                React.createElement('button', {
                    key: `page-${page}`,
                    onClick: () => handlePageChange(page),
                    className: `px-4 py-2 rounded-md ${
                        currentPage === page 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`
                }, page)
            ),
            
            React.createElement('button', {
                key: 'next-btn',
                onClick: () => handlePageChange(currentPage + 1),
                disabled: currentPage === totalPages,
                className: `px-4 py-2 rounded-md ${
                    currentPage === totalPages 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`
            }, 'Next')
        ])
    ]);
};
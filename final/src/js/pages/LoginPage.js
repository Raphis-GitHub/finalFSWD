// js/pages/LoginPage.js

const LoginPage = ({ setCurrentPage }) => {
    const { login } = useAuth();
    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(formData.email, formData.password);
        if (result.success) {
            setCurrentPage('home');
        } else {
            setError(result.error);
        }
    };

    return React.createElement('div', {
        className: "max-w-md mx-auto mt-12 px-4"
    }, React.createElement('div', {
        className: "bg-white rounded-lg shadow-md p-8"
    }, [
        React.createElement('h2', {
            key: 'title',
            className: "text-2xl font-bold text-gray-900 mb-6 text-center"
        }, 'Login'),
        
        error && React.createElement('div', {
            key: 'error',
            className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        }, error),

        React.createElement('div', {
            key: 'demo-accounts',
            className: "mb-6 p-4 bg-blue-50 rounded-lg"
        }, [
            React.createElement('h3', {
                key: 'demo-title',
                className: "font-semibold text-blue-900 mb-2"
            }, 'Demo Accounts:'),
            React.createElement('p', {
                key: 'customer-demo',
                className: "text-sm text-blue-800 mb-1"
            }, 'Customer: customer@demo.com / 123456'),
            React.createElement('p', {
                key: 'admin-demo',
                className: "text-sm text-blue-800"
            }, 'Admin: admin@demo.com / admin123')
        ]),

        React.createElement('form', {
            key: 'login-form',
            onSubmit: handleSubmit,
            className: "space-y-4"
        }, [
            React.createElement('div', {
                key: 'email-field'
            }, [
                React.createElement('label', {
                    key: 'email-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Email'),
                React.createElement('input', {
                    key: 'email-input',
                    type: "email",
                    value: formData.email,
                    onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true
                })
            ]),
            React.createElement('div', {
                key: 'password-field'
            }, [
                React.createElement('label', {
                    key: 'password-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Password'),
                React.createElement('input', {
                    key: 'password-input',
                    type: "password",
                    value: formData.password,
                    onChange: (e) => setFormData(prev => ({ ...prev, password: e.target.value })),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true
                })
            ]),
            React.createElement('button', {
                key: 'submit-btn',
                type: "submit",
                className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
            }, 'Login')
        ]),

        React.createElement('div', {
            key: 'register-link',
            className: "mt-6 text-center"
        }, React.createElement('p', {
            className: "text-gray-600"
        }, [
            "Don't have an account? ",
            React.createElement('button', {
                key: 'register-btn',
                onClick: () => setCurrentPage('register'),
                className: "text-blue-600 hover:text-blue-800 font-medium"
            }, 'Sign up')
        ]))
    ]));
};
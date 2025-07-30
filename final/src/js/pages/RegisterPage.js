// js/pages/RegisterPage.js
import React, { useState, createElement } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = ({ setCurrentPage }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const result = register(formData);
            if (result.success) {
                setCurrentPage('home');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(''); // Clear error when user starts typing
    };

    return createElement('div', {
        className: "max-w-md mx-auto mt-8 px-4"
    }, createElement('div', {
        className: "bg-white rounded-lg shadow-md p-8"
    }, [
        createElement('h2', {
            key: 'title',
            className: "text-2xl font-bold text-gray-900 mb-6 text-center"
        }, 'Create Account'),
        
        error && createElement('div', {
            key: 'error',
            className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        }, error),

        createElement('form', {
            key: 'register-form',
            onSubmit: handleSubmit,
            className: "space-y-4"
        }, [
            createElement('div', {
                key: 'name-field'
            }, [
                createElement('label', {
                    key: 'name-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Full Name'),
                createElement('input', {
                    key: 'name-input',
                    type: "text",
                    value: formData.name,
                    onChange: (e) => handleInputChange('name', e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true,
                    disabled: loading
                })
            ]),
            createElement('div', {
                key: 'email-field'
            }, [
                createElement('label', {
                    key: 'email-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Email Address'),
                createElement('input', {
                    key: 'email-input',
                    type: "email",
                    value: formData.email,
                    onChange: (e) => handleInputChange('email', e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true,
                    disabled: loading
                })
            ]),
            createElement('div', {
                key: 'password-field'
            }, [
                createElement('label', {
                    key: 'password-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Password'),
                createElement('input', {
                    key: 'password-input',
                    type: "password",
                    value: formData.password,
                    onChange: (e) => handleInputChange('password', e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true,
                    disabled: loading,
                    minLength: 6
                })
            ]),
            createElement('div', {
                key: 'confirm-password-field'
            }, [
                createElement('label', {
                    key: 'confirm-password-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Confirm Password'),
                createElement('input', {
                    key: 'confirm-password-input',
                    type: "password",
                    value: formData.confirmPassword,
                    onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true,
                    disabled: loading
                })
            ]),
            createElement('div', {
                key: 'address-field'
            }, [
                createElement('label', {
                    key: 'address-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Address'),
                createElement('input', {
                    key: 'address-input',
                    type: "text",
                    value: formData.address,
                    onChange: (e) => handleInputChange('address', e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true,
                    disabled: loading
                })
            ]),
            createElement('div', {
                key: 'phone-field'
            }, [
                createElement('label', {
                    key: 'phone-label',
                    className: "block text-sm font-medium text-gray-700 mb-2"
                }, 'Phone Number'),
                createElement('input', {
                    key: 'phone-input',
                    type: "tel",
                    value: formData.phone,
                    onChange: (e) => handleInputChange('phone', e.target.value),
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    required: true,
                    disabled: loading
                })
            ]),
            createElement('button', {
                key: 'submit-btn',
                type: "submit",
                disabled: loading,
                className: `w-full py-3 rounded-md transition-colors ${
                    loading 
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`
            }, loading ? 'Creating Account...' : 'Create Account')
        ]),

        createElement('div', {
            key: 'login-link',
            className: "mt-6 text-center"
        }, createElement('p', {
            className: "text-gray-600"
        }, [
            "Already have an account? ",
            createElement('button', {
                key: 'login-btn',
                onClick: () => setCurrentPage('login'),
                className: "text-blue-600 hover:text-blue-800 font-medium"
            }, 'Sign in')
        ]))
    ]));
};

export default RegisterPage;
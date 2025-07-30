// Updated AuthContext with API integration
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';
import socketService from '../services/socketService';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_USER':
            return { ...state, currentUser: action.payload, loading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'LOGOUT':
            return { currentUser: null, loading: false, error: null };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        currentUser: null,
        loading: true,
        error: null
    });

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('currentUser');
            
            if (token && storedUser) {
                try {
                    // Verify token is still valid by getting fresh profile
                    const response = await apiService.getProfile();
                    if (response.success) {
                        dispatch({ type: 'SET_USER', payload: response.data.user });
                        // Connect to socket service
                        socketService.connect(token);
                    } else {
                        // Invalid token, clear storage
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('currentUser');
                        dispatch({ type: 'SET_USER', payload: null });
                    }
                } catch (error) {
                    // Token invalid or expired
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    dispatch({ type: 'SET_USER', payload: null });
                }
            } else {
                dispatch({ type: 'SET_USER', payload: null });
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password, rememberMe = false) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });
            
            const response = await apiService.login(email, password, rememberMe);
            
            if (response.success) {
                dispatch({ type: 'SET_USER', payload: response.data.user });
                // Connect to socket service
                socketService.connect(response.data.accessToken);
                return { success: true };
            } else {
                dispatch({ type: 'SET_ERROR', payload: response.message });
                return { success: false, error: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Login failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });
            
            const response = await apiService.register(userData);
            
            if (response.success) {
                dispatch({ type: 'SET_USER', payload: response.data.user });
                // Connect to socket service
                socketService.connect(response.data.accessToken);
                return { success: true };
            } else {
                dispatch({ type: 'SET_ERROR', payload: response.message });
                return { success: false, error: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Registration failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Disconnect socket
            socketService.disconnect();
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateProfile = async (profileData) => {
        try {
            dispatch({ type: 'CLEAR_ERROR' });
            
            const response = await apiService.updateProfile(profileData);
            
            if (response.success) {
                dispatch({ type: 'SET_USER', payload: response.data.user });
                // Update localStorage
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                return { success: true };
            } else {
                dispatch({ type: 'SET_ERROR', payload: response.message });
                return { success: false, error: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Profile update failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            return { success: false, error: errorMessage };
        }
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        currentUser: state.currentUser,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        updateProfile,
        clearError
    };

    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
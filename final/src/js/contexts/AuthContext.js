// js/contexts/AuthContext.js

const { createContext, useContext } = React;

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth provider component
const AuthProvider = ({ children, value }) => {
    return React.createElement(
        AuthContext.Provider,
        { value },
        children
    );
};
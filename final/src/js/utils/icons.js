// js/utils/icons.js - Simple icon components using Unicode symbols

const HeartIcon = ({ filled = false, className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, filled ? '❤️' : '🤍');
};

const StarIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1em' }
    }, '⭐');
};

const CartIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '🛒');
};

const SearchIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '🔍');
};

const MenuIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '☰');
};

const CloseIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '✕');
};

const TruckIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '2em' }
    }, '🚚');
};

const ShieldIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '2em' }
    }, '🛡️');
};

const PackageIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '2em' }
    }, '📦');
};

const UserIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '👤');
};

const LogoutIcon = ({ className = "" }) => {
    return React.createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '↪️');
};
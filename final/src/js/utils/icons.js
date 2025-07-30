// js/utils/icons.js - Simple icon components using Unicode symbols
import React, { createElement } from 'react';

const HeartIcon = ({ filled = false, className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, filled ? '❤️' : '🤍');
};

const StarIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1em' }
    }, '⭐');
};

const CartIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '🛒');
};

const SearchIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '🔍');
};

const MenuIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '☰');
};

const CloseIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '✕');
};

const TruckIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '2em' }
    }, '🚚');
};

const ShieldIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '2em' }
    }, '🛡️');
};

const PackageIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '2em' }
    }, '📦');
};

const UserIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '👤');
};

const LogoutIcon = ({ className = "" }) => {
    return createElement('span', {
        className: className,
        style: { fontSize: '1.2em' }
    }, '↪️');
};

export {
    HeartIcon,
    StarIcon,
    CartIcon,
    SearchIcon,
    MenuIcon,
    CloseIcon,
    TruckIcon,
    ShieldIcon,
    PackageIcon,
    UserIcon,
    LogoutIcon
};
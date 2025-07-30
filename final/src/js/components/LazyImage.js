// js/components/LazyImage.js
import React, { useState, createElement } from 'react';

const LazyImage = ({ src, alt, className, placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%' height='100%' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='18' fill='%23374151' text-anchor='middle' dy='.3em'%3ELoading...%3C/text%3E%3C/svg%3E" }) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState(null);

    const handleImageLoad = () => {
        setImageSrc(src);
    };

    const handleImageError = () => {
        setImageSrc(placeholder);
    };

    return createElement('img', {
        ref: setImageRef,
        src: imageSrc,
        alt: alt,
        className: className,
        onLoad: handleImageLoad,
        onError: handleImageError,
        loading: 'lazy'
    });
};

export default LazyImage;
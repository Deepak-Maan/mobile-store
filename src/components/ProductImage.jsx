import React from 'react';

export const ProductImage = ({ src, alt, className, style }) => {
  if (!src) return null;

  const isSvg = src.trim().startsWith('<svg');

  if (isSvg) {
    return (
      <div
        className={`product-image-svg-container ${className || ''}`}
        dangerouslySetInnerHTML={{ __html: src }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...style
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Smartphone'}
      className={`product-image-img ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style
      }}
      onError={(e) => {
        // Fallback or placeholder handling if the image fails to load
        e.target.onerror = null;
        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>';
      }}
    />
  );
};

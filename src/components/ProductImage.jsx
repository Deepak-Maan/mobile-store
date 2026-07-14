import React, { useState, useEffect } from 'react';

// Cache processed base64 data URLs to make image switching instantaneous
const colorCache = new Map();

export const ProductImage = ({ src, alt, className, style, color }) => {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!src || typeof src !== 'string') return;

    const isSvg = src.trim().startsWith('<svg') || src.trim().includes('</svg>');
    if (isSvg || !color) {
      setDisplaySrc(src);
      return;
    }

    const cacheKey = `${src}-${color}`;
    if (colorCache.has(cacheKey)) {
      setDisplaySrc(colorCache.get(cacheKey));
      return;
    }

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a === 0) continue;

          // Calculate perceived brightness/luminosity
          const l = 0.299 * r + 0.587 * g + 0.114 * b;

          // Target midtone metallic ranges of the phone chassis/body shell.
          // Screen wallpapers are bright/saturated; camera lenses/shadows are very dark.
          // By checking if the pixel is gray/metallic (low saturation): |R-G| < 35, |G-B| < 35, |R-B| < 35,
          // we colorize ONLY the metallic body shell.
          const diffRG = Math.abs(r - g);
          const diffGB = Math.abs(g - b);
          const diffRB = Math.abs(r - b);

          if (l >= 40 && l <= 245 && diffRG < 35 && diffGB < 35 && diffRB < 35) {
            // Apply theme color shifts to midtone metallic chassis parts
            if (color === 'Obsidian Black') {
              // Sleek matte obsidian black
              data[i] = l * 0.22;
              data[i + 1] = l * 0.22;
              data[i + 2] = l * 0.25;
            } else if (color === 'Titanium Silver') {
              // Shiny silver/white metal
              data[i] = Math.min(255, l * 1.16);
              data[i + 1] = Math.min(255, l * 1.16);
              data[i + 2] = Math.min(255, l * 1.20);
            } else if (color === 'Emerald Green') {
              // Rich metallic emerald green
              data[i] = l * 0.22;
              data[i + 1] = Math.min(255, l * 0.76);
              data[i + 2] = l * 0.44;
            } else if (color === 'Desert Gold') {
              // Premium metallic desert gold
              data[i] = Math.min(255, l * 0.94);
              data[i + 1] = Math.min(255, l * 0.78);
              data[i + 2] = l * 0.48;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL();
        colorCache.set(cacheKey, dataUrl);
        setDisplaySrc(dataUrl);
      } catch {
        // Fallback to original image path if CORS restricts canvas reading (e.g. testing local server files)
        setDisplaySrc(src);
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setDisplaySrc(src);
      setIsProcessing(false);
    };
  }, [src, color]);

  if (!src || typeof src !== 'string') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      </div>
    );
  }

  const isSvg = src.trim().startsWith('<svg') || src.trim().includes('</svg>');

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
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img
        src={displaySrc}
        alt={alt || 'Smartphone'}
        className={`product-image-img ${className || ''}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: isProcessing ? 0.75 : 1,
          transition: 'opacity 0.2s ease',
          ...style
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>';
        }}
      />
      {isProcessing && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          border: '2px solid var(--primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s infinite linear',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
};

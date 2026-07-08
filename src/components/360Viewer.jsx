import React, { useState, useRef } from 'react';
import { ProductImage } from './ProductImage';

export const Phone360Viewer = ({ images, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startIndexRef = useRef(0);

  if (!images || images.length === 0) return null;

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startIndexRef.current = currentIndex;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    
    // 1 image index change per 40px dragged
    const step = 40;
    const offset = Math.floor(deltaX / step);
    
    // Cycle index between 0 and images.length - 1
    let nextIndex = (startIndexRef.current - offset) % images.length;
    if (nextIndex < 0) {
      nextIndex = images.length + nextIndex;
    }
    
    setCurrentIndex(nextIndex);
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startIndexRef.current = currentIndex;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const step = 40;
    const offset = Math.floor(deltaX / step);
    let nextIndex = (startIndexRef.current - offset) % images.length;
    if (nextIndex < 0) {
      nextIndex = images.length + nextIndex;
    }
    setCurrentIndex(nextIndex);
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        position: 'relative',
        userSelect: 'none'
      }}
      title="Click and drag horizontally to rotate phone"
    >
      <div style={{ width: '100%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ProductImage src={images[currentIndex]} alt={`${name} angle ${currentIndex}`} />
      </div>
      
      {/* Visual Indicator Dots */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
        {images.map((_, idx) => (
          <div 
            key={idx}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: currentIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
              transition: 'background-color 0.2s ease'
            }}
          />
        ))}
      </div>
      
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        ← Drag horizontally to rotate →
      </span>
    </div>
  );
};

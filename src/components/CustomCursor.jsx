import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const mouseCoords = useRef({ x: 0, y: 0 });
  const ringCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeaveWindow = () => setIsVisible(false);
    const handleMouseEnterWindow = () => setIsVisible(true);
    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const isClickable = target.closest(
        'a, button, select, input, textarea, [role="button"], .product-card, .faq-item, .modal-thumbnail-btn, .filter-btn, .sort-select, .bento-card, .stat-card, .testimonial-card'
      );
      setIsHovered(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Simple smooth physics lag (lerp) loop
    let animFrame;
    const updateCursor = () => {
      const targetX = mouseCoords.current.x;
      const targetY = mouseCoords.current.y;

      // Inner dot follows mouse instantly
      if (dotRef.current) {
        gsap.set(dotRef.current, {
          x: targetX,
          y: targetY,
          overwrite: 'auto'
        });
      }

      // Outer ring lags behind with simple lerp
      if (ringRef.current) {
        const lerpFactor = 0.15;
        ringCoords.current.x += (targetX - ringCoords.current.x) * lerpFactor;
        ringCoords.current.y += (targetY - ringCoords.current.y) * lerpFactor;

        gsap.set(ringRef.current, {
          x: ringCoords.current.x,
          y: ringCoords.current.y,
          overwrite: 'auto'
        });
      }

      animFrame = requestAnimationFrame(updateCursor);
    };
    animFrame = requestAnimationFrame(updateCursor);

    document.body.classList.add('hide-native-cursor');

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animFrame);
      document.body.classList.remove('hide-native-cursor');
    };
  }, [isVisible]);

  // Adjust cursor scale on state changes (hover, click)
  useEffect(() => {
    if (!isVisible || !ringRef.current || !dotRef.current) return;

    let ringScale = 1;
    let ringOpacity = 0.75;
    let dotScale = 1;

    if (isHovered) {
      ringScale = 1.5;
      ringOpacity = 0.45;
      dotScale = 0.6;
    }

    if (isClicked) {
      ringScale = 0.8;
      ringOpacity = 0.95;
      dotScale = 1.3;
    }

    gsap.to(ringRef.current, {
      scale: ringScale,
      opacity: ringOpacity,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to(dotRef.current, {
      scale: dotScale,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }, [isHovered, isClicked, isVisible]);

  if (window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      {/* continuous subtle spinning animation for the outer ring notch */}
      <style>{`
        @keyframes cursorSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .simple-cursor-ring {
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          /* Ring is solid with a distinct primary-colored top segment (notch) */
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-top-color: var(--primary);
          animation: cursorSpin 2.8s linear infinite;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.15);
          will-change: transform;
        }
        .simple-cursor-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--secondary);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 6px var(--primary-glow);
          will-change: transform;
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.25s ease'
        }}
      >
        {/* Lagging Ring with spinning border notch */}
        <div ref={ringRef} className="simple-cursor-ring" />
        
        {/* Precise Core Dot */}
        <div ref={dotRef} className="simple-cursor-dot" />
      </div>
    </>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const mouseCoordsRef = useRef({ x: 0, y: 0 });
  const ringCoordsRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Hide custom cursor on touch/mobile devices
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    // Show cursor on first mouse move
    const handleMouseMove = (e) => {
      mouseCoordsRef.current.x = e.clientX;
      mouseCoordsRef.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    // Global Hover Delegation
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isClickable = target.closest(
        'a, button, select, input, textarea, [role="button"], .product-card, .faq-item, .modal-thumbnail-btn, .filter-btn, .sort-select'
      );

      setIsHovered(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Render loop for physics-based cursor lag (lerp)
    let animFrame;
    const updateCursor = () => {
      const targetX = mouseCoordsRef.current.x;
      const targetY = mouseCoordsRef.current.y;

      // Position inner dot instantly
      if (dotRef.current) {
        gsap.set(dotRef.current, {
          x: targetX,
          y: targetY,
          overwrite: 'auto'
        });
      }

      // Position outer ring with smooth interpolation (lerp)
      if (ringRef.current) {
        const lerpFactor = 0.16; // lag weight
        ringCoordsRef.current.x += (targetX - ringCoordsRef.current.x) * lerpFactor;
        ringCoordsRef.current.y += (targetY - ringCoordsRef.current.y) * lerpFactor;

        gsap.set(ringRef.current, {
          x: ringCoordsRef.current.x,
          y: ringCoordsRef.current.y,
          overwrite: 'auto'
        });
      }

      animFrame = requestAnimationFrame(updateCursor);
    };
    animFrame = requestAnimationFrame(updateCursor);

    // Apply cursor: none globally
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

  // Adjust cursor scale on state changes
  useEffect(() => {
    if (!isVisible) return;

    let ringScale = 1;
    let ringOpacity = 0.7;
    let dotScale = 1;

    if (isHovered) {
      ringScale = 1.8;
      ringOpacity = 0.35;
      dotScale = 0.5;
    }

    if (isClicked) {
      ringScale = 0.9;
      dotScale = 1.3;
      ringOpacity = 0.9;
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Lagging Ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHovered ? 'hovered' : ''}`}
        style={{
          position: 'absolute',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1.5px solid var(--primary)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.25)'
        }}
      />
      {/* Precise Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isHovered ? 'var(--secondary)' : 'var(--primary)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 6px var(--primary-glow)'
        }}
      />
    </div>
  );
};

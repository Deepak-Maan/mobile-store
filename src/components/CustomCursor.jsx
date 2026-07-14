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
  const prevMouseCoords = useRef({ x: 0, y: 0 });
  const activeHoverTarget = useRef(null);

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
        'a, button, select, input, textarea, [role="button"], .product-card, .faq-item, .modal-thumbnail-btn, .filter-btn, .sort-select, .bento-card, .stat-card, .testimonial-card, .nav-btn, .nav-links a'
      );
      
      setIsHovered(!!isClickable);

      // Check if target is highly magnetic
      const isMagnetic = target.closest(
        '.nav-btn, .filter-btn, .card-btn, .add-to-cart-btn, #nav-user-menu-btn, .back-to-top-btn'
      );
      if (isMagnetic) {
        activeHoverTarget.current = isMagnetic;
      } else {
        activeHoverTarget.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Continuous spin tracker
    let spinAngle = 0;
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

      // Outer ring physics (velocity stretch, angle of movement, magnetic snap)
      if (ringRef.current) {
        const dx = targetX - prevMouseCoords.current.x;
        const dy = targetY - prevMouseCoords.current.y;
        prevMouseCoords.current.x = targetX;
        prevMouseCoords.current.y = targetY;

        const speed = Math.sqrt(dx * dx + dy * dy);
        const travelAngle = Math.atan2(dy, dx) * (180 / Math.PI);

        let destX = targetX;
        let destY = targetY;
        let scaleX = 1;
        let scaleY = 1;
        let rotateAngle = spinAngle;

        spinAngle = (spinAngle + 1.5) % 360;

        if (activeHoverTarget.current) {
          // Snap outer ring to target
          const rect = activeHoverTarget.current.getBoundingClientRect();
          destX = rect.left + rect.width / 2;
          destY = rect.top + rect.height / 2;
          
          // Outer ring envelopes the clickable element slightly
          scaleX = (rect.width + 12) / 28;
          scaleY = (rect.height + 12) / 28;
          rotateAngle = 0;
        } else {
          // Jelly speed stretching along travel angle
          const maxStretch = 0.45;
          const stretch = Math.min(speed / 90, maxStretch);
          scaleX = 1 + stretch;
          scaleY = 1 - stretch;
          rotateAngle = travelAngle;
        }

        const lerpFactor = activeHoverTarget.current ? 0.22 : 0.14;
        ringCoords.current.x += (destX - ringCoords.current.x) * lerpFactor;
        ringCoords.current.y += (destY - ringCoords.current.y) * lerpFactor;

        gsap.set(ringRef.current, {
          x: ringCoords.current.x,
          y: ringCoords.current.y,
          scaleX: scaleX,
          scaleY: scaleY,
          rotation: rotateAngle,
          borderRadius: activeHoverTarget.current ? '10px' : '50%',
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

  // Adjust cursor styling/scaling on state changes (hover, click)
  useEffect(() => {
    if (!isVisible || !ringRef.current || !dotRef.current) return;

    let ringColor = 'rgba(255, 255, 255, 0.12)';
    let ringBorderColor = 'var(--primary)';
    let ringOpacity = 0.75;
    let dotScale = 1;
    let dotOpacity = 1;

    if (isHovered) {
      ringOpacity = 0.45;
      dotScale = 0.5;
      if (activeHoverTarget.current) {
        ringColor = 'rgba(99, 102, 241, 0.08)';
        ringBorderColor = 'rgba(99, 102, 241, 0.45)';
        ringOpacity = 0.9;
        dotOpacity = 0; // Hide inner dot when fully snapped for a clean look
      }
    }

    if (isClicked) {
      ringOpacity = 0.95;
      dotScale = 1.35;
    }

    gsap.to(ringRef.current, {
      borderColor: ringBorderColor,
      backgroundColor: ringColor,
      opacity: ringOpacity,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to(dotRef.current, {
      scale: dotScale,
      opacity: dotOpacity,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }, [isHovered, isClicked, isVisible]);

  if (window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      <style>{`
        .hide-native-cursor, .hide-native-cursor * {
          cursor: none !important;
        }
        .simple-cursor-ring {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-top-color: var(--primary);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
          will-change: transform, width, height, border-radius;
          pointer-events: none;
        }
        .simple-cursor-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--secondary);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px var(--primary-glow);
          will-change: transform;
          pointer-events: none;
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
        {/* Lagging Ring with speed stretch and magnet snapping */}
        <div ref={ringRef} className="simple-cursor-ring" />
        
        {/* Precise Core Dot */}
        <div ref={dotRef} className="simple-cursor-dot" />
      </div>
    </>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
  const dotRef  = useRef(null);
  const hLineRef = useRef(null);
  const vLineRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const mouseCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown  = () => setIsClicked(true);
    const handleMouseUp    = () => setIsClicked(false);

    const handleMouseOver = (e) => {
      const clickable = e.target?.closest(
        'a, button, select, input, textarea, [role="button"], .product-card, .faq-item, .filter-btn, .bento-card, .nav-btn'
      );
      setIsHovered(!!clickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    let animFrame;
    const update = () => {
      const x = mouseCoords.current.x;
      const y = mouseCoords.current.y;

      if (dotRef.current)   gsap.set(dotRef.current,   { x, y, overwrite: 'auto' });
      if (hLineRef.current) gsap.set(hLineRef.current, { x, y, overwrite: 'auto' });
      if (vLineRef.current) gsap.set(vLineRef.current, { x, y, overwrite: 'auto' });

      animFrame = requestAnimationFrame(update);
    };
    animFrame = requestAnimationFrame(update);

    document.body.classList.add('hide-native-cursor');

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animFrame);
      document.body.classList.remove('hide-native-cursor');
    };
  }, [isVisible]);

  /* Hover / click styling reactions */
  useEffect(() => {
    if (!isVisible) return;

    const color     = isHovered ? 'var(--secondary)' : 'var(--primary)';
    const dotSize   = isClicked ? '10px' : isHovered ? '7px' : '5px';
    const lineLen   = isHovered ? '14px' : isClicked ? '10px' : '12px';
    const opacity   = isHovered ? 0.9 : 0.65;

    if (dotRef.current) {
      gsap.to(dotRef.current, {
        width: dotSize, height: dotSize,
        backgroundColor: color,
        boxShadow: `0 0 ${isHovered ? 10 : 6}px ${color}`,
        opacity: 1,
        duration: 0.18, ease: 'power2.out', overwrite: 'auto'
      });
    }
    if (hLineRef.current) {
      gsap.to(hLineRef.current, {
        width: lineLen,
        backgroundColor: color,
        opacity,
        duration: 0.18, ease: 'power2.out', overwrite: 'auto'
      });
    }
    if (vLineRef.current) {
      gsap.to(vLineRef.current, {
        height: lineLen,
        backgroundColor: color,
        opacity,
        duration: 0.18, ease: 'power2.out', overwrite: 'auto'
      });
    }
  }, [isHovered, isClicked, isVisible]);

  if (window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      <style>{`
        .hide-native-cursor,
        .hide-native-cursor * {
          cursor: none !important;
        }
        /* re-allow text cursor on text inputs */
        .hide-native-cursor input[type="text"],
        .hide-native-cursor input[type="password"],
        .hide-native-cursor input[type="email"],
        .hide-native-cursor input[type="number"],
        .hide-native-cursor textarea {
          cursor: text !important;
        }
        .xhair-dot {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--primary);
          transform: translate(-50%, -50%);
          pointer-events: none;
          will-change: transform;
          box-shadow: 0 0 6px var(--primary);
        }
        .xhair-h {
          position: absolute;
          width: 12px;
          height: 1.5px;
          background: var(--primary);
          transform: translate(-50%, -50%);
          pointer-events: none;
          will-change: transform;
          border-radius: 2px;
        }
        .xhair-v {
          position: absolute;
          width: 1.5px;
          height: 12px;
          background: var(--primary);
          transform: translate(-50%, -50%);
          pointer-events: none;
          will-change: transform;
          border-radius: 2px;
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0,
        pointerEvents: 'none', zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}>
        {/* Horizontal arm */}
        <div ref={hLineRef} className="xhair-h" />
        {/* Vertical arm */}
        <div ref={vLineRef} className="xhair-v" />
        {/* Centre dot */}
        <div ref={dotRef}   className="xhair-dot" />
      </div>
    </>
  );
};

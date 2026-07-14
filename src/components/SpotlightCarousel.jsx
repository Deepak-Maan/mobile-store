import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// ---------- Individual Card ----------
const PhoneCard = ({ brand, name, color, price, specs, svgColors, isMobile }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineX, setShineX] = useState(50);
  const [shineY, setShineY] = useState(50);
  const [lifted, setLifted] = useState(false);

  // ── Desktop: mouse-track 3D tilt ──
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotateX(((y / rect.height) - 0.5) * -28);
    setRotateY(((x / rect.width) - 0.5) * 28);
    setShineX((x / rect.width) * 100);
    setShineY((y / rect.height) * 100);
    setLifted(true);
  };
  const handleMouseLeave = () => {
    setRotateX(0); setRotateY(0);
    setShineX(50); setShineY(50);
    setLifted(false);
  };

  // ── Mobile: gyroscope tilt (DeviceOrientation) ──
  useEffect(() => {
    if (!isMobile) return;
    const onOrientation = (e) => {
      // beta = front-back tilt (-90 to 90), gamma = left-right (-90 to 90)
      const rx = Math.max(-14, Math.min(14, -(e.beta ?? 0) * 0.25));
      const ry = Math.max(-14, Math.min(14, (e.gamma ?? 0) * 0.35));
      setRotateX(rx);
      setRotateY(ry);
      setShineX(50 + ry * 2);
      setShineY(50 - rx * 2);
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [isMobile]);

  // ── Mobile: touch drag tilt ──
  const handleTouchMove = (e) => {
    if (!isMobile) return;
    const card = cardRef.current;
    if (!card) return;
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setRotateX(((y / rect.height) - 0.5) * -20);
    setRotateY(((x / rect.width) - 0.5) * 20);
    setShineX((x / rect.width) * 100);
    setShineY((y / rect.height) * 100);
  };
  const handleTouchEnd = () => {
    setRotateX(0); setRotateY(0);
    setShineX(50); setShineY(50);
  };

  const cardW = isMobile ? '90vw' : '250px';
  const cardMaxW = isMobile ? '320px' : '250px';
  const cardH = isMobile ? '380px' : '420px';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      animate={{ rotateX, rotateY, scale: lifted ? 1.04 : 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 180 }}
      style={{
        position: 'relative',
        width: cardW,
        maxWidth: cardMaxW,
        height: cardH,
        borderRadius: '22px',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        padding: '1.4rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        boxShadow: lifted
          ? '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)'
          : '0 16px 36px rgba(0,0,0,0.35)',
        flexShrink: 0,
        touchAction: 'none', // prevent default scroll during touch tilt
      }}
    >
      {/* Shine overlay */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 60%)`,
          pointerEvents: 'none', zIndex: 3,
          transition: isMobile ? 'none' : undefined,
        }}
      />

      {/* Brand / Name */}
      <div style={{ transform: 'translateZ(22px)', zIndex: 2 }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {brand}
        </span>
        <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.2rem', fontWeight: '900', color: '#fff', margin: '0.2rem 0 0.25rem' }}>
          {name}
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)' }}>{color}</span>
      </div>

      {/* Phone SVG */}
      <div style={{
        transform: 'translateZ(42px) scale(0.92)',
        zIndex: 2,
        height: isMobile ? '160px' : '175px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 100 200" style={{ height: '100%' }}>
          <defs>
            <linearGradient id={`sc-grad-${name.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={svgColors[0]} />
              <stop offset="100%" stopColor={svgColors[1]} />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="80" height="180" rx="14" fill={`url(#sc-grad-${name.replace(/\s/g, '')})`} stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
          <rect x="13" y="13" width="74" height="174" rx="12" fill="#090a0f" />
          <circle cx="50" cy="22" r="3" fill="#1e293b" />
          <rect x="20" y="30" width="60" height="130" rx="8" fill="none" stroke="rgba(129,140,248,0.1)" strokeWidth="1" />
        </svg>
      </div>

      {/* Price / Specs */}
      <div style={{
        transform: 'translateZ(26px)', zIndex: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Price</span>
          <span style={{ fontSize: '1rem', fontWeight: '900', color: '#fff' }}>₹{price.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.58rem', color: '#818cf8', fontWeight: 'bold' }}>{specs}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ---------- Main Section ----------
export const SpotlightCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cards = [
    { brand: 'Apple',   name: 'iPhone 15 Pro',     color: 'Natural Titanium',  price: 134900, specs: 'A17 PRO • ZOOM',         svgColors: ['#6b7280', '#374151'] },
    { brand: 'Samsung', name: 'Galaxy S24 Ultra',   color: 'Titanium Yellow',   price: 129999, specs: 'SNAPDRAGON • 200MP',     svgColors: ['#f59e0b', '#78350f'] },
    { brand: 'Google',  name: 'Pixel 8 Pro',        color: 'Bay Blue',          price: 106999, specs: 'TENSOR G3 • AI LENS',   svgColors: ['#06b6d4', '#083344'] },
    { brand: 'OnePlus', name: 'OnePlus 12',         color: 'Flowy Emerald',     price: 64999,  specs: 'HASSELBLAD • 5400mAh', svgColors: ['#10b981', '#064e3b'] },
  ];

  return (
    <div
      style={{
        background: '#090a0f',
        padding: isMobile ? '4rem 0' : '6rem 2rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? '2rem' : '3rem',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 1.5rem' }}>
        <span style={{
          background: 'linear-gradient(90deg, #ec4899, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: '0.82rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '3px',
          display: 'block', marginBottom: '0.5rem',
        }}>
          Curated Spotlights
        </span>
        <h2 style={{
          fontSize: isMobile ? 'clamp(1.8rem, 8vw, 2.4rem)' : '2.5rem',
          fontWeight: '900', color: '#fff', letterSpacing: '-1px',
        }}>
          Interactive Renders
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: isMobile ? '0.82rem' : '0.9rem',
          marginTop: '0.5rem', padding: '0 0.5rem',
        }}>
          {isMobile
            ? 'Touch and drag any card to tilt it in 3D space.'
            : 'Move your cursor over the glassmorphic cards to explore 3D depth and reflections.'}
        </p>
      </div>

      {/* Cards — horizontal scroll on mobile, wrap grid on desktop */}
      {isMobile ? (
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '1.25rem',
            padding: '1rem 1.5rem 2rem',
            width: '100%',
            boxSizing: 'border-box',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .sc-scroll::-webkit-scrollbar { display: none; }
          `}} />
          {cards.map((c) => (
            <div key={c.name} style={{ scrollSnapAlign: 'center', flexShrink: 0 }}>
              <PhoneCard {...c} isMobile={isMobile} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          maxWidth: '1200px',
          perspective: '1000px',
        }}>
          {cards.map((c) => (
            <PhoneCard key={c.name} {...c} isMobile={isMobile} />
          ))}
        </div>
      )}

      {/* Mobile scroll indicator dots */}
      {isMobile && (
        <div style={{ display: 'flex', gap: '6px' }}>
          {cards.map((_, i) => (
            <div key={i} style={{
              width: i === 0 ? '18px' : '6px', height: '6px',
              borderRadius: '3px',
              background: i === 0 ? '#818cf8' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

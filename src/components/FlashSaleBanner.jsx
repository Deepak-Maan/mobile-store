import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Flame } from 'lucide-react';

export const FlashSaleBanner = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const getSecondsToMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight - now) / 1000);
  };

  useEffect(() => {
    // Initial calculation
    setSecondsLeft(getSecondsToMidnight());

    const interval = setInterval(() => {
      const remaining = getSecondsToMidnight();
      if (remaining <= 0) {
        setSecondsLeft(0);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((val) => String(val).padStart(2, '0'))
      .join(':');
  };

  if (!isVisible || secondsLeft <= 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
        color: '#ffffff',
        width: '100%',
        position: 'relative',
        zIndex: 1000,
        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.25)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.55rem 2.5rem 0.55rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          textAlign: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Flame size={14} className="pulse-icon" style={{ fill: '#fbbf24', color: '#fbbf24' }} />
          <span style={{ letterSpacing: '1px' }}>FLASH SALE:</span>
        </div>

        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '0.15rem 0.6rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            letterSpacing: '0.5px',
          }}
        >
          Ends in {formatTime(secondsLeft)}
        </div>

        <span
          style={{
            opacity: 0.9,
            fontSize: '0.76rem',
            fontWeight: 500,
          }}
          className="sale-promo-text"
        >
          Use code <strong style={{ color: '#fbbf24' }}>AURA20</strong> at checkout for 20% off your purchase!
        </span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          opacity: 0.7,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        aria-label="Dismiss banner"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
};

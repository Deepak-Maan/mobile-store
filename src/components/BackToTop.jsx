import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BackToTop = ({ compareActive }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 30 }}
          whileHover={{ 
            scale: 1.1, 
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.4)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            position: 'fixed',
            bottom: compareActive ? '6.5rem' : '2rem',
            right: '2rem',
            zIndex: 280,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(99, 102, 241, 0.2)',
            outline: 'none',
            transition: 'bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          aria-label="Back to top"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block' }}
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

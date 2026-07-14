import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Safe no-op default so useCartFly() never returns undefined outside provider
const CartFlyContext = createContext({ triggerFly: () => {} });

export const useCartFly = () => useContext(CartFlyContext);

export const CartFlyProvider = ({ children }) => {
  const [particles, setParticles] = useState([]);

  const triggerFly = (clickEvent, imageUrl) => {
    // Guard: need a valid event with client coordinates
    if (!clickEvent || typeof clickEvent.clientX !== 'number') return;

    // Get start position from mouse click coordinates
    const startX = clickEvent.clientX;
    const startY = clickEvent.clientY;

    // Get end position of Navbar cart button
    const cartEl = document.getElementById('nav-cart-btn') || document.querySelector('.cart-icon-wrapper');
    let endX = window.innerWidth - 100;
    let endY = 30;

    if (cartEl) {
      const rect = cartEl.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Add particle to array
    setParticles((prev) => [
      ...prev,
      {
        id,
        startX,
        startY,
        endX,
        endY,
        imageUrl,
      },
    ]);
  };

  const removeParticle = (id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <CartFlyContext.Provider value={{ triggerFly }}>
      {children}
      <CartFlyAnimation particles={particles} onComplete={removeParticle} />
    </CartFlyContext.Provider>
  );
};

const CartFlyAnimation = ({ particles, onComplete }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.startX - 20,
              y: p.startY - 20,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: [p.startX - 20, p.startX - 50, p.endX - 15],
              y: [p.startY - 20, p.startY - 120, p.endY - 15],
              scale: [1, 1.2, 0.25],
              opacity: [1, 0.9, 0.3],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.25, 1, 0.5, 1],
            }}
            onAnimationComplete={() => onComplete(p.id)}
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--primary, #6366f1)',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.6)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

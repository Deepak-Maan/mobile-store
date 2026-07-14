import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const SalesTicker = () => {
  const { products } = useStore();
  const [ticker, setTicker] = useState(null);

// Static data moved outside component to avoid exhaustive-deps warnings
const SHOPPER_NAMES = ['Arjun', 'Priya', 'Amit', 'Neha', 'Vikram', 'Anjali', 'Deepak', 'Sneha', 'Rahul', 'Ritu'];
const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];


  useEffect(() => {
    if (products.length === 0) return;

    const runTicker = () => {
      const name = SHOPPER_NAMES[Math.floor(Math.random() * SHOPPER_NAMES.length)];
      const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
      const activeProducts = products.filter(p => p.brand !== 'Aura Accessories');
      if (activeProducts.length === 0) return;
      const product = activeProducts[Math.floor(Math.random() * activeProducts.length)];
      const timeOffset = Math.floor(Math.random() * 50) + 10; 

      setTicker({ name, city, productName: product.name, timeOffset });

      setTimeout(() => {
        setTicker(null);
      }, 5500);
    };

    const initialDelay = setTimeout(runTicker, 10000);
    const interval = setInterval(runTicker, 22000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  return (
    <AnimatePresence>
      {ticker && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            zIndex: 400,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: '320px',
            pointerEvents: 'none'
          }}
        >
          <div 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'rgba(99, 102, 241, 0.12)', 
              border: '1px solid rgba(99, 102, 241, 0.25)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--primary)',
              flexShrink: 0
            }}
          >
            <ShoppingBag width="16" height="16" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
              {ticker.name} from {ticker.city}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              just purchased {ticker.productName} ({ticker.timeOffset}s ago)
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

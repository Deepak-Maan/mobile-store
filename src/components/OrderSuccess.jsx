import React from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const OrderSuccess = () => {
  const { orders, switchView } = useStore();

  const latestOrder = orders[orders.length - 1];

  return (
    <section id="success-view" className="view-section active">
      <div className="success-card" id="purchase-success-card">
        <motion.div 
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 15, delay: 0.15 }}
          className="success-icon-wrapper"
        >
          <Check width="40" height="40" strokeWidth={3} />
        </motion.div>
        
        <h2>Purchase Complete!</h2>
        {latestOrder ? (
          <p id="success-message-text">
            Your order <strong>{latestOrder.id}</strong> has been received.<br />
            Total amount: <strong>${latestOrder.total.toLocaleString()}</strong>.<br />
            A confirmation email was dispatched to <em>{latestOrder.email}</em>.
          </p>
        ) : (
          <p id="success-message-text">Your order has been recorded. We will ship your new smartphone shortly.</p>
        )}
        
        <div className="success-actions" style={{ marginTop: '2rem' }}>
          <button 
            className="hero-btn" 
            id="success-home-btn" 
            onClick={() => switchView('storefront')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Check, Clipboard, ClipboardCheck, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { formatINR } from '../utils/currency';

export const OrderSuccess = () => {
  const { orders, switchView, setTrackingOrderId } = useStore();
  const [copied, setCopied] = useState(false);

  const latestOrder = orders[orders.length - 1];

  const handleCopy = () => {
    if (latestOrder) {
      navigator.clipboard.writeText(latestOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrack = () => {
    if (latestOrder) {
      setTrackingOrderId(latestOrder.id);
      switchView('tracking');
    }
  };

  return (
    <section id="success-view" className="view-section active">
      <div className="success-card" id="purchase-success-card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2.5rem' }}>
        
        {/* Animated Check Icon */}
        <motion.div 
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 15, delay: 0.15 }}
          className="success-icon-wrapper"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid #22c55e',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.2)'
          }}
        >
          <Check width="40" height="40" strokeWidth={3} />
        </motion.div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', color: '#fff' }}>
          Order Confirmed!
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '1rem' }}>
          Thank you for your purchase. Your payment was successful and your order is being processed.
        </p>

        {latestOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
            
            {/* Order ID Copy Box */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Order Identifier
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                  {latestOrder.id}
                </div>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color)'}`,
                  color: copied ? '#22c55e' : 'var(--text-secondary)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.25s ease'
                }}
              >
                {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Quick Details Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.01)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px', 
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Amount Paid</div>
                  <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{formatINR(latestOrder.total)}</strong>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.01)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px', 
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Mail size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email Receipt</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }} title={latestOrder.email}>
                    {latestOrder.email}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem', 
          marginTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem' 
        }}>
          <button 
            className="btn" 
            onClick={handleTrack}
            style={{
              padding: '0.9rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)'
            }}
          >
            Track My Order Now
            <ArrowRight size={16} />
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => switchView('storefront')}
            style={{
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </section>
  );
};

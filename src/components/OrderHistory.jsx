import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/currency';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, Package, ArrowRight, Truck, MapPin } from 'lucide-react';

const STATUS_COLORS = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  processing: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  shipped:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  delivered:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)'  },
  cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
};

export const OrderHistory = () => {
  const { orders, currentUser, switchView, setTrackingOrderId } = useStore();

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '3rem 2rem', borderRadius: '16px' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Please sign in to your customer profile to view your purchase order history.</p>
          <button className="btn" onClick={() => switchView('storefront')} style={{ border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', cursor: 'pointer' }}>
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Filter orders for logged-in user
  const userOrders = orders
    .filter(order => order.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim())
    .reverse();

  const handleTrackOrder = (orderId) => {
    setTrackingOrderId(orderId);
    switchView('tracking');
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Your Order History
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Review your shopping record, invoice details, and tracking histories.
          </p>
        </div>
        <button 
          className="nav-btn" 
          onClick={() => switchView('storefront')}
          style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)' }}
        >
          Continue Shopping
          <ArrowRight size={14} />
        </button>
      </div>

      {userOrders.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '5rem 2rem', borderRadius: '16px', textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Orders Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            You haven't placed any smartphone orders yet. Explore our luxury collection to find your next companion.
          </p>
          <button 
            className="btn" 
            onClick={() => switchView('storefront')}
            style={{ border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', cursor: 'pointer' }}
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {userOrders.map((order) => {
            const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            
            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="checkout-card"
                style={{ padding: '1.8rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}
              >
                {/* Card Top / Order Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</span>
                      <strong style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace' }}>#{order.id}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={12} color="var(--primary)" />
                        {order.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={12} color="var(--primary)" />
                        {order.address.split(',')[0]} {/* City/Short address */}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                      padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.7rem',
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      display: 'inline-block'
                    }}>
                      {order.status}
                    </span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '0.4rem' }}>
                      {formatINR(order.total)}
                    </div>
                  </div>
                </div>

                {/* Items Breakdown list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong style={{ color: '#fff' }}>{item.name}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>× {item.quantity}</span>
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                      {(item.storage || item.color) && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.storage || '128GB'} • {item.color || 'Obsidian Black'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Card Actions / Tracking Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1rem' }}>
                  <div>
                    {order.paymentMethod === 'upi' && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        UPI Payment
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleTrackOrder(order.id)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: 'var(--primary)',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Truck size={14} />
                    Track Shipment
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

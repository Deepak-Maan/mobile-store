import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, AlertCircle, Calendar, CreditCard, Package, MapPin, Truck, CheckCircle2 } from 'lucide-react';

const STATUS_COLORS = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  processing: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  shipped:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  delivered:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)'  },
  cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      display: 'inline-block'
    }}>
      {status}
    </span>
  );
};

export const OrderTracker = () => {
  const { orders, fetchOrders, switchView, trackingOrderId, setTrackingOrderId } = useStore();
  const [orderIdInput, setOrderIdInput] = useState(trackingOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (trackingOrderId) {
      let cleanTrackingId = trackingOrderId.trim();
      if (cleanTrackingId.startsWith('#')) {
        cleanTrackingId = cleanTrackingId.substring(1).trim();
      }
      setOrderIdInput(cleanTrackingId);
      const autoSearch = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
          const freshOrders = await fetchOrders();
          if (!freshOrders || !Array.isArray(freshOrders)) {
            throw new Error("Invalid response format received from server.");
          }
          const match = freshOrders.find(o => o && o.id && o.id.toLowerCase().replace('#', '').trim() === cleanTrackingId.toLowerCase());
          if (match) {
            setSearchedOrder(match);
          } else {
            setSearchedOrder(null);
            setErrorMsg(`We couldn't find an order matching "${cleanTrackingId}". Please check the Order ID and try again.`);
          }
          setHasSearched(true);
        } catch (err) {
          console.error("OrderTracker autoSearch error details:", err);
          setErrorMsg(`Failed to look up order: ${err.message || err}`);
        } finally {
          setIsLoading(false);
        }
      };
      autoSearch();
    }
  }, [trackingOrderId]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    let query = orderIdInput.trim();
    if (!query) return;

    if (query.startsWith('#')) {
      query = query.substring(1).trim();
    }

    setTrackingOrderId(query); // Sync with store context
    setIsLoading(true);
    setErrorMsg('');
    try {
      const freshOrders = await fetchOrders();
      if (!freshOrders || !Array.isArray(freshOrders)) {
        throw new Error("Invalid response format received from server.");
      }
      const match = freshOrders.find(o => o && o.id && o.id.toLowerCase().replace('#', '').trim() === query.toLowerCase());
      if (match) {
        setSearchedOrder(match);
      } else {
        setSearchedOrder(null);
        setErrorMsg(`We couldn't find an order matching "${query}". Please check the Order ID and try again.`);
      }
      setHasSearched(true);
    } catch (err) {
      console.error("OrderTracker handleSearch error details:", err);
      setErrorMsg(`Failed to look up order: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimelineSteps = (order) => {
    const steps = [];
    
    // 1. Initial order placement
    steps.push({
      title: 'Order Placed',
      date: order.date,
      location: 'AURA Online Store',
      note: 'Payment authorized and order received.',
      status: 'pending',
      icon: Package,
      completed: true
    });

    // 2. Add tracking updates if any
    if (order.trackingUpdates && order.trackingUpdates.length > 0) {
      order.trackingUpdates.forEach((upd) => {
        const formattedDate = new Date(upd.timestamp).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        steps.push({
          title: upd.status.charAt(0).toUpperCase() + upd.status.slice(1),
          date: formattedDate,
          location: upd.location,
          note: upd.note,
          status: upd.status,
          icon: upd.status === 'shipped' ? Truck : upd.status === 'delivered' ? CheckCircle2 : MapPin,
          completed: true
        });
      });
    } else {
      // 3. Fallback mock steps based on current status if no explicit updates
      if (order.status === 'processing') {
        steps.push({
          title: 'Processing',
          date: order.date,
          location: 'Fulfillment Center',
          note: 'Your items are being carefully picked, packed and quality tested.',
          status: 'processing',
          icon: MapPin,
          completed: true
        });
      } else if (order.status === 'shipped') {
        steps.push({
          title: 'Processing',
          date: order.date,
          location: 'Fulfillment Center',
          note: 'Order packed.',
          status: 'processing',
          icon: MapPin,
          completed: true
        });
        steps.push({
          title: 'Shipped',
          date: order.date,
          location: 'Carrier Hub',
          note: 'Package handed over to courier partner. Transit underway.',
          status: 'shipped',
          icon: Truck,
          completed: true
        });
      } else if (order.status === 'delivered') {
        steps.push({
          title: 'Processing',
          date: order.date,
          location: 'Fulfillment Center',
          note: 'Order packed.',
          status: 'processing',
          icon: MapPin,
          completed: true
        });
        steps.push({
          title: 'Shipped',
          date: order.date,
          location: 'Carrier Hub',
          note: 'Package handed over to courier partner.',
          status: 'shipped',
          icon: Truck,
          completed: true
        });
        steps.push({
          title: 'Delivered',
          date: order.date,
          location: 'Destination',
          note: 'Handed over directly to customer. Thank you for shopping with AURA!',
          status: 'delivered',
          icon: CheckCircle2,
          completed: true
        });
      }
    }

    return steps;
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back to Shop Link */}
      <button 
        className="nav-btn" 
        onClick={() => switchView('storefront')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem 1rem' }}
      >
        <ArrowLeft size={16} />
        Back to Shop
      </button>

      {/* Hero Header */}
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #a5a6c5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem' }}>
          Track Your Order
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
          Enter your Order ID (e.g. ORD-123456) received at checkout or in your confirmation email.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', width: '100%', maxWidth: '550px', margin: '0 auto 3rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Enter Order ID"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.75rem', height: '50px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={isLoading || !orderIdInput.trim()}
          style={{ height: '50px', padding: '0 1.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          {isLoading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Results Display */}
      <AnimatePresence mode="wait">
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="cancel-info-card"
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.25)', maxWidth: '550px', margin: '0 auto' }}
          >
            <AlertCircle color="#ef4444" size={20} style={{ flexShrink: 0 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{errorMsg}</p>
          </motion.div>
        )}

        {hasSearched && searchedOrder && (
          <motion.div
            key={searchedOrder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="checkout-card"
            style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>#{searchedOrder.id}</h2>
                  <StatusBadge status={searchedOrder.status} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Placed on: <strong>{searchedOrder.date}</strong>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  Total: {formatINR(searchedOrder.total)}
                </div>
              </div>
            </div>

            {/* Cancel Alert Card */}
            {searchedOrder.status === 'cancelled' && (
              <div className="cancel-info-card" style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>Order Cancelled & Refund Initiated</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                    <strong>Reason for Cancellation:</strong> {searchedOrder.cancelReason || 'Requested by customer or stock shortage.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <CreditCard size={14} />
                      Refund Amount: <strong style={{ color: '#fff' }}>{formatINR(searchedOrder.total)}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      Expected Refund Date: <strong style={{ color: '#22c55e' }}>{searchedOrder.refundDate || 'Within 7 business days'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="tracking-timeline-container" style={{ position: 'relative', paddingLeft: '2.5rem' }}>
              {/* Vertical timeline connector */}
              <div style={{
                position: 'absolute',
                left: '0.85rem',
                top: '0.5rem',
                bottom: '0.5rem',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--primary) 0%, rgba(255,255,255,0.05) 100%)',
                opacity: 0.7
              }} />

              {/* Steps */}
              {getTimelineSteps(searchedOrder).reverse().map((step, idx) => {
                const StepIcon = step.icon;
                const isFirst = idx === 0;
                const s = STATUS_COLORS[step.status] || STATUS_COLORS.pending;

                return (
                  <div key={idx} style={{ position: 'relative', marginBottom: '2.25rem' }}>
                    {/* Circle icon */}
                    <div style={{
                      position: 'absolute',
                      left: '-2.5rem',
                      top: '0.25rem',
                      width: '1.8rem',
                      height: '1.8rem',
                      borderRadius: '50%',
                      background: isFirst ? s.color : 'var(--bg-dark)',
                      border: `2px solid ${s.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isFirst ? `0 0 12px ${s.color}66` : 'none',
                      zIndex: 2,
                      transition: 'all 0.3s ease'
                    }}>
                      <StepIcon size={12} color={isFirst ? '#000' : s.color} style={{ strokeWidth: 3 }} />
                    </div>

                    {/* Step body */}
                    <div style={{
                      background: isFirst ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: isFirst ? '1px solid var(--border-color)' : 'none',
                      padding: isFirst ? '1rem 1.25rem' : '0 0.5rem',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: isFirst ? '#fff' : 'var(--text-secondary)' }}>
                          {step.title}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {step.date}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, marginTop: '0.25rem' }}>
                        <MapPin size={10} />
                        <span>{step.location}</span>
                      </div>

                      {step.note && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', lineHeight: 1.5, opacity: 0.9 }}>
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Order Items summary */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Items Ordered</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {searchedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>{item.name} <strong style={{ color: 'var(--text-muted)' }}>x{item.quantity}</strong></span>
                    <strong style={{ color: '#fff' }}>{formatINR(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

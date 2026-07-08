import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, XCircle, Plus, Truck, Clock, User, Mail, Phone,
  Package, Calendar, CreditCard, ChevronRight, AlertTriangle,
  CheckCircle2, Loader, ShoppingBag, Hash
} from 'lucide-react';

const STATUS_META = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  Icon: Clock,         label: 'Pending'    },
  processing: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', Icon: Loader,        label: 'Processing' },
  shipped:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', Icon: Truck,         label: 'Shipped'    },
  delivered:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  Icon: CheckCircle2,  label: 'Delivered'  },
  cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  Icon: XCircle,       label: 'Cancelled'  },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.Icon;
  return (
    <span 
      className={`admin-order-status-badge status-${status}`}
      style={{
        color: m.color,
        background: m.bg,
        borderColor: m.border
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {m.label}
    </span>
  );
};

/* ─── Detail Slide Panel ─── */
const OrderDetailPanel = ({ order, onClose }) => {
  const { addTrackingUpdate, cancelOrderWithReason } = useStore();

  const [trackLocation, setTrackLocation] = useState('');
  const [trackNote, setTrackNote]         = useState('');
  const [trackStatus, setTrackStatus]     = useState(order.status === 'cancelled' ? 'processing' : order.status);
  const [trackLoading, setTrackLoading]   = useState(false);

  const [cancelReason, setCancelReason]   = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancel, setShowCancel]       = useState(false);

  const isCancelled = order.status === 'cancelled';

  const handleAddTracking = async () => {
    if (!trackLocation.trim()) return;
    setTrackLoading(true);
    await addTrackingUpdate(order.id, trackLocation.trim(), trackNote.trim(), trackStatus);
    setTrackLocation('');
    setTrackNote('');
    setTrackLoading(false);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    const ok = await cancelOrderWithReason(order.id, cancelReason.trim());
    if (ok) { setCancelReason(''); setShowCancel(false); }
    setCancelLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="admin-order-detail-panel"
    >
      {/* Header */}
      <div className="admin-order-detail-header">
        <div>
          <div className="admin-order-detail-id-row">
            <span className="admin-order-detail-id-text">#{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="admin-order-detail-meta">
            Placed on {order.date} · {order.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}
          </p>
        </div>
        <button onClick={onClose} className="admin-order-detail-close-btn">
          Close ✕
        </button>
      </div>

      <div className="admin-order-detail-grid">

        {/* Customer Info */}
        <div className="admin-order-info-card">
          <h4>Customer Details</h4>
          <div className="admin-order-info-card-list">
            <div className="admin-order-info-item">
              <User size={14} color="var(--primary)" />
              <span className="admin-order-info-value">{order.customerName}</span>
            </div>
            <div className="admin-order-info-item">
              <Mail size={14} color="var(--primary)" />
              <span className="admin-order-info-label">{order.email}</span>
            </div>
            <div className="admin-order-info-item">
              <Phone size={14} color="var(--primary)" />
              <span className="admin-order-info-label">{order.phone}</span>
            </div>
            <div className="admin-order-info-item align-start">
              <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <span className="admin-order-info-label">{order.address}</span>
            </div>
            {order.paymentMethod === 'upi' && order.utrNumber && (
              <div className="admin-order-info-item">
                <Hash size={14} color="#a5b4fc" />
                <span className="admin-order-info-label" style={{ color: '#a5b4fc' }}>UTR: <code style={{ color: '#fff' }}>{order.utrNumber}</code></span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="admin-order-info-card">
          <h4>Order Items</h4>
          <div className="admin-order-items-list">
            {order.items.map((item, idx) => (
              <div key={idx} className="admin-order-item-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="admin-order-item-details">
                    <div className="admin-order-item-name" style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="admin-order-item-qty" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                  </div>
                  <span className="admin-order-item-price" style={{ fontWeight: 600 }}>{formatINR(item.price * item.quantity)}</span>
                </div>
                {(item.storage || item.color) && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500, paddingLeft: '0.2rem' }}>
                    {item.storage || '128GB'} • {item.color || 'Obsidian Black'}
                  </div>
                )}
              </div>
            ))}
            <div className="admin-order-detail-total-row">
              <span>Order Total</span>
              <strong>{formatINR(order.total)}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Tracking History */}
      {order.trackingUpdates && order.trackingUpdates.length > 0 && (
        <div className="admin-order-tracking-card">
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={13} /> Tracking History
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[...order.trackingUpdates].reverse().map((upd, i, arr) => {
              const st = STATUS_META[upd.status] || STATUS_META.pending;
              const isLast = i === arr.length - 1;
              return (
                <div key={i} className="admin-order-tracking-step">
                  {/* Line */}
                  {!isLast && (
                    <div className="admin-order-tracking-line" />
                  )}
                  {/* Dot */}
                  <div 
                    className="admin-order-tracking-dot" 
                    style={{ 
                      background: i === 0 ? st.color : 'var(--bg-dark)', 
                      border: `2px solid ${st.color}`,
                      boxShadow: i === 0 ? `0 0 10px ${st.color}55` : 'none'
                    }} 
                  />
                  <div className="admin-order-tracking-body">
                    <div className="admin-order-tracking-header">
                      <span className={`admin-order-tracking-loc ${i === 0 ? 'active' : ''}`}>{upd.location}</span>
                      <div className="admin-order-tracking-meta">
                        <StatusBadge status={upd.status} />
                        <span className="admin-order-tracking-time">
                          {new Date(upd.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {upd.note && <p className="admin-order-tracking-note">{upd.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled info */}
      {isCancelled && order.cancelReason && (
        <div className="admin-order-cancel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.88rem' }}>Order Cancelled</span>
          </div>
          <p className="admin-order-info-label" style={{ marginBottom: '0.75rem' }}>
            <strong>Reason:</strong> {order.cancelReason}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <CreditCard size={13} />
              Refund: <strong style={{ color: '#fff' }}>{formatINR(order.total)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Calendar size={13} />
              Refund by: <strong style={{ color: '#22c55e' }}>{order.refundDate || 'Within 7 days'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Add Tracking Update */}
      {!isCancelled && (
        <div className="admin-order-form-panel">
          <h4>
            <MapPin size={13} /> Push Location / Status Update
          </h4>
          <div className="order-manage-fields" style={{ marginBottom: '0.75rem' }}>
            <input
              className="admin-input"
              placeholder="Location (e.g. Mumbai Distribution Hub)"
              value={trackLocation}
              onChange={(e) => setTrackLocation(e.target.value)}
              style={{ height: '42px', flex: 1 }}
            />
            <select
              className="order-status-select"
              value={trackStatus}
              onChange={(e) => setTrackStatus(e.target.value)}
              style={{ height: '42px', minWidth: '130px' }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <textarea
            className="admin-input"
            placeholder="Note (optional — e.g. Picked up by Blue Dart courier)"
            value={trackNote}
            onChange={(e) => setTrackNote(e.target.value)}
            rows={2}
            style={{ width: '100%', resize: 'vertical', marginBottom: '0.75rem' }}
          />
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleAddTracking}
            disabled={trackLoading || !trackLocation.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={15} />
            {trackLoading ? 'Pushing Update…' : 'Push Tracking Update'}
          </button>
        </div>
      )}

      {/* Cancel Order */}
      {!isCancelled && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(239,68,68,0.12)', paddingTop: '1rem' }}>
          <button
            onClick={() => setShowCancel(v => !v)}
            style={{ background: 'none', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <XCircle size={14} />
            {showCancel ? 'Hide Cancel Form' : 'Cancel This Order'}
          </button>

          <AnimatePresence>
            {showCancel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <textarea
                  className="admin-input"
                  placeholder="Cancellation reason (visible to customer)…"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', borderColor: 'rgba(239,68,68,0.3)', marginTop: '0.75rem', marginBottom: '0.6rem' }}
                />
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading || !cancelReason.trim()}
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: cancelLoading || !cancelReason.trim() ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: !cancelReason.trim() ? 0.5 : 1 }}
                >
                  <XCircle size={14} />
                  {cancelLoading ? 'Cancelling…' : 'Confirm Cancellation'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

/* ─── Order Card ─── */
const OrderCard = ({ order, isOpen, onToggle }) => {
  const m = STATUS_META[order.status] || STATUS_META.pending;

  return (
    <div className={`admin-order-card ${isOpen ? 'expanded' : ''}`}>
      {/* Card Row */}
      <div
        onClick={onToggle}
        className="admin-order-card-header"
      >
        {/* Status dot + ID */}
        <div className="admin-order-card-identity">
          <div 
            className="admin-order-card-dot" 
            style={{ 
              background: m.color, 
              boxShadow: `0 0 8px ${m.color}88` 
            }} 
          />
          <div>
            <div className="admin-order-card-id-text">{order.id}</div>
            <div className="admin-order-card-date">
              <Calendar size={10} /> {order.date}
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="admin-order-card-customer">
          <div className="admin-order-card-cust-name">{order.customerName}</div>
          <div className="admin-order-card-cust-email">{order.email}</div>
        </div>

        {/* Items summary */}
        <div className="admin-order-card-items">
          <ShoppingBag size={13} color="var(--primary)" />
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>

        {/* Total + Status */}
        <div className="admin-order-card-summary">
          <div className="admin-order-card-total">{formatINR(order.total)}</div>
          <div className="admin-order-card-badge-box"><StatusBadge status={order.status} /></div>
        </div>

        {/* Expand arrow */}
        <div className="admin-order-card-arrow">
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="admin-order-detail-wrapper">
            <OrderDetailPanel order={order} onClose={onToggle} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Tab ─── */
export const OrdersTab = () => {
  const { orders } = useStore();
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  const filtered = [...orders]
    .reverse()
    .filter(o => filterStatus === 'all' || o.status === filterStatus)
    .filter(o => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    });

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const FILTERS = [
    { key: 'all',        label: 'All Orders',  count: orders.length },
    { key: 'pending',    label: 'Pending',     count: counts.pending    || 0 },
    { key: 'processing', label: 'Processing',  count: counts.processing || 0 },
    { key: 'shipped',    label: 'Shipped',     count: counts.shipped    || 0 },
    { key: 'delivered',  label: 'Delivered',   count: counts.delivered  || 0 },
    { key: 'cancelled',  label: 'Cancelled',   count: counts.cancelled  || 0 },
  ];

  return (
    <div className="admin-panel active" id="admin-panel-orders">
      {/* Header */}
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <h2>Order Management</h2>
          <p>Track, update, and manage all customer purchase orders from one place.</p>
        </div>
        <div className="admin-orders-stats-row">
          {/* Stats pill */}
          <div className="admin-orders-stats-pill">
            {orders.length} Total Orders
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-orders-filter-bar">
        {FILTERS.map(f => {
          const m = STATUS_META[f.key];
          const isActive = filterStatus === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`admin-filter-btn ${isActive ? 'active' : ''}`}
              style={isActive && m ? {
                borderColor: m.color,
                background: m.bg,
                color: m.color
              } : {}}
            >
              {f.label}
              {f.count > 0 && (
                <span 
                  className="admin-filter-badge"
                  style={isActive && m ? {
                    background: m.color,
                    color: '#000'
                  } : {}}
                >
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="admin-orders-search-wrapper">
        <input
          className="admin-input"
          placeholder="Search by order ID, customer name, or email…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Package size={16} />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="admin-orders-empty-state">
          <Package size={40} />
          <p className="admin-orders-empty-state-title">No orders found</p>
          <p className="admin-orders-empty-state-subtext">
            {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'No customer purchases have been placed yet.'}
          </p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isOpen={expandedId === order.id}
              onToggle={() => toggle(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

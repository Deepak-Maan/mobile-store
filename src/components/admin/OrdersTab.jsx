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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
      padding: '0.28rem 0.75rem', borderRadius: '20px',
      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
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
  const m = STATUS_META[order.status] || STATUS_META.pending;

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
      style={{
        background: 'rgba(10, 10, 20, 0.85)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.75rem',
        marginTop: '0.75rem',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>#{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Placed on {order.date} · {order.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
          Close ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        {/* Customer Info */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.1rem' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.9rem' }}>Customer Details</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={14} color="var(--primary)" />
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{order.customerName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Mail size={14} color="var(--primary)" />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{order.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={14} color="var(--primary)" />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{order.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>{order.address}</span>
            </div>
            {order.paymentMethod === 'upi' && order.utrNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Hash size={14} color="#a5b4fc" />
                <span style={{ color: '#a5b4fc', fontSize: '0.82rem' }}>UTR: <code style={{ color: '#fff' }}>{order.utrNumber}</code></span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.1rem' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.9rem' }}>Order Items</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Qty: {item.quantity}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Order Total</span>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tracking History */}
      {order.trackingUpdates && order.trackingUpdates.length > 0 && (
        <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.1rem' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={13} /> Tracking History
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[...order.trackingUpdates].reverse().map((upd, i, arr) => {
              const st = STATUS_META[upd.status] || STATUS_META.pending;
              const isLast = i === arr.length - 1;
              return (
                <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {/* Line */}
                  {!isLast && (
                    <div style={{ position: 'absolute', left: '0.54rem', top: '1.5rem', bottom: '-0.5rem', width: '2px', background: 'rgba(255,255,255,0.06)' }} />
                  )}
                  {/* Dot */}
                  <div style={{ width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: i === 0 ? st.color : 'var(--bg-dark)', border: `2px solid ${st.color}`, flexShrink: 0, marginTop: '0.2rem', boxShadow: i === 0 ? `0 0 10px ${st.color}55` : 'none' }} />
                  <div style={{ paddingBottom: isLast ? '0' : '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: i === 0 ? '#fff' : 'var(--text-secondary)', fontSize: '0.85rem' }}>{upd.location}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StatusBadge status={upd.status} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          {new Date(upd.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {upd.note && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{upd.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled info */}
      {isCancelled && order.cancelReason && (
        <div style={{ marginTop: '1.25rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.88rem' }}>Order Cancelled</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
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
        <div style={{ marginTop: '1.25rem', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '1.1rem' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={13} /> Push Location / Status Update
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input
              className="admin-input"
              placeholder="Location (e.g. Mumbai Distribution Hub)"
              value={trackLocation}
              onChange={(e) => setTrackLocation(e.target.value)}
              style={{ height: '42px' }}
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
                style={{ overflow: 'hidden', marginTop: '0.75rem' }}
              >
                <textarea
                  className="admin-input"
                  placeholder="Cancellation reason (visible to customer)…"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '0.6rem' }}
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
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`, background: isOpen ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.01)', transition: 'all 0.25s ease' }}>
      {/* Card Row */}
      <div
        onClick={onToggle}
        style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', alignItems: 'center', gap: '1.25rem', padding: '1.1rem 1.25rem', cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Status dot + ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color, boxShadow: `0 0 8px ${m.color}88`, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{order.id}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={10} /> {order.date}
            </div>
          </div>
        </div>

        {/* Customer */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customerName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.email}</div>
        </div>

        {/* Items summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', minWidth: '80px' }}>
          <ShoppingBag size={13} color="var(--primary)" />
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>

        {/* Total + Status */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>{formatINR(order.total)}</div>
          <div style={{ marginTop: '0.25rem' }}><StatusBadge status={order.status} /></div>
        </div>

        {/* Expand arrow */}
        <div style={{ color: isOpen ? 'var(--primary)' : 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Stats pill */}
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 700 }}>
            {orders.length} Total Orders
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', padding: '0 0.25rem' }}>
        {FILTERS.map(f => {
          const m = STATUS_META[f.key];
          const isActive = filterStatus === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: isActive ? `1px solid ${m ? m.color : 'var(--primary)'}` : '1px solid var(--border-color)',
                background: isActive ? (m ? m.bg : 'rgba(99,102,241,0.1)') : 'transparent',
                color: isActive ? (m ? m.color : 'var(--primary)') : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              {f.label}
              {f.count > 0 && (
                <span style={{ background: isActive ? (m ? m.color : 'var(--primary)') : 'rgba(255,255,255,0.08)', color: isActive ? '#000' : 'var(--text-muted)', borderRadius: '10px', padding: '0 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <input
          className="admin-input"
          placeholder="Search by order ID, customer name, or email…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.75rem', height: '44px' }}
        />
        <Package size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <Package size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No orders found</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
            {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'No customer purchases have been placed yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

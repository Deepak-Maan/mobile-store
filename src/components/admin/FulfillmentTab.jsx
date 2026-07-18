import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronRight, ChevronLeft, RefreshCw, User, MapPin, CreditCard, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  {
    key: 'pending',
    label: 'Pending',
    icon: '🕐',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    bg: 'rgba(245,158,11,0.06)',
    headerBg: 'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(245,158,11,0.04))',
    border: 'rgba(245,158,11,0.22)',
    desc: 'Awaiting confirmation',
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: '⚙️',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
    bg: 'rgba(59,130,246,0.06)',
    headerBg: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(59,130,246,0.04))',
    border: 'rgba(59,130,246,0.22)',
    desc: 'Being prepared',
  },
  {
    key: 'packed',
    label: 'Packed',
    icon: '📦',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.2)',
    bg: 'rgba(168,85,247,0.06)',
    headerBg: 'linear-gradient(135deg, rgba(168,85,247,0.14), rgba(168,85,247,0.04))',
    border: 'rgba(168,85,247,0.22)',
    desc: 'Ready to dispatch',
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: '🚚',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.2)',
    bg: 'rgba(99,102,241,0.06)',
    headerBg: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.04))',
    border: 'rgba(99,102,241,0.22)',
    desc: 'In transit',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: '✅',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.2)',
    bg: 'rgba(34,197,94,0.06)',
    headerBg: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.04))',
    border: 'rgba(34,197,94,0.22)',
    desc: 'Completed',
  },
  {
    key: 'returned',
    label: 'Returned',
    icon: '↩️',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.2)',
    bg: 'rgba(239,68,68,0.06)',
    headerBg: 'linear-gradient(135deg, rgba(239,68,68,0.14), rgba(239,68,68,0.04))',
    border: 'rgba(239,68,68,0.22)',
    desc: 'Refund pending',
  },
];

const paymentLabel = (m) => ({ upi: 'UPI', cod: 'Cash on Delivery', card: 'Card', wallet: 'Wallet' }[m] || m || '—');

export const FulfillmentTab = () => {
  const { addToast } = useStore();
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPipeline = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res = await fetch('/api/admin/fulfillment', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPipeline(await res.json());
    } catch {
      if (!silent) addToast('Failed to load pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  const moveOrder = async (orderId, direction) => {
    console.log('[FulfillmentTab] moveOrder called:', { orderId, direction });
    setMoving(orderId);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    console.log('[FulfillmentTab] token retrieved:', token ? 'exists' : 'null');
    try {
      const url = `/api/admin/fulfillment/${orderId}`;
      console.log('[FulfillmentTab] fetching:', url);
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ direction }),
      });
      console.log('[FulfillmentTab] response status:', res.status);
      const data = await res.json();
      console.log('[FulfillmentTab] response data:', data);
      if (res.ok) {
        const label = STAGES.find(s => s.key === data.newStage)?.label || data.newStage;
        addToast(`Order #${orderId} → ${label}`, 'success');
        await fetchPipeline(true);
      } else {
        addToast(data.error || 'Move failed.', 'error');
      }
    } catch (err) {
      console.error('[FulfillmentTab] fetch error:', err);
      addToast('Connection error.', 'error');
    } finally {
      setMoving(null);
    }
  };

  const totalOrders = Object.values(pipeline).reduce((s, a) => s + (a?.length || 0), 0);
  const delivered = pipeline['delivered']?.length || 0;
  const rate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading fulfillment pipeline…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '11px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.18))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>📋</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.45rem', color: '#fff', margin: 0, letterSpacing: '-0.4px' }}>
              Fulfillment Pipeline
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              {totalOrders} total orders &nbsp;·&nbsp; {rate}% delivered
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{ paddingLeft: '2rem', paddingRight: '0.8rem', paddingTop: '0.42rem', paddingBottom: '0.42rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.78rem', outline: 'none', width: '145px' }}
            />
          </div>
          <button onClick={() => fetchPipeline()} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.42rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.76rem', fontWeight: '600' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stage progress strip ── */}
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STAGES.map((s, i) => {
            const count = pipeline[s.key]?.length || 0;
            const isLast = i === STAGES.length - 1;
            return (
              <React.Fragment key={s.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', fontSize: '0.95rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: count > 0 ? s.bg : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${count > 0 ? s.color : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: count > 0 ? `0 0 10px ${s.glow}` : 'none',
                    transition: 'all 0.3s',
                  }}>{s.icon}</div>
                  <span style={{ fontSize: '0.6rem', fontWeight: '700', color: count > 0 ? s.color : 'var(--text-muted)', letterSpacing: '0.3px' }}>{s.label}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '800', minWidth: '18px', textAlign: 'center',
                    color: count > 0 ? '#000' : 'var(--text-muted)',
                    background: count > 0 ? s.color : 'rgba(255,255,255,0.05)',
                    borderRadius: '999px', padding: '0 5px',
                  }}>{count}</span>
                </div>
                {!isLast && (
                  <div style={{ flex: '0 0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
                    <ChevronRight size={12} color="rgba(255,255,255,0.15)" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Kanban: 3 columns × 2 rows (no scroll) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.9rem',
      }}>
        {STAGES.map((stage, stageIdx) => {
          const isFirst = stageIdx === 0;
          const isLast  = stageIdx === STAGES.length - 1;

          const orders = (pipeline[stage.key] || []).filter(o => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return o.id?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q) || o.product?.toLowerCase().includes(q);
          });

          return (
            <div key={stage.key} style={{
              borderRadius: '14px',
              border: `1px solid ${orders.length > 0 ? stage.border : 'rgba(255,255,255,0.06)'}`,
              background: 'rgba(10,10,16,0.65)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              boxShadow: orders.length > 0 ? `0 2px 20px ${stage.glow}` : 'none',
            }}>

              {/* Column header */}
              <div style={{ padding: '0.75rem 0.9rem', background: stage.headerBg, borderBottom: `1px solid ${stage.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '1rem' }}>{stage.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: stage.color, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{stage.label}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '1px' }}>{stage.desc}</div>
                    </div>
                  </div>
                  <span style={{
                    minWidth: '22px', height: '22px', borderRadius: '999px', padding: '0 6px',
                    background: orders.length > 0 ? stage.color : 'rgba(255,255,255,0.06)',
                    color: orders.length > 0 ? '#000' : 'var(--text-muted)',
                    fontSize: '0.65rem', fontWeight: '900',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: orders.length > 0 ? `0 1px 6px ${stage.glow}` : 'none',
                  }}>{orders.length}</span>
                </div>
              </div>

              {/* Cards scroll area — max height so cards don't explode */}
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto', overflowX: 'hidden' }}>
                <AnimatePresence>
                  {orders.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ padding: '1.5rem 0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span style={{ fontSize: '1.4rem', opacity: 0.25 }}>{stage.icon}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>No orders here</span>
                    </motion.div>
                  ) : orders.map(order => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.93 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '11px',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Color bar */}
                      <div style={{ height: '2.5px', background: `linear-gradient(90deg, ${stage.color}, transparent)` }} />

                      {/* Card body */}
                      <div style={{ padding: '0.65rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {/* ID + items */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.62rem', fontWeight: '800', color: stage.color, fontFamily: 'monospace', letterSpacing: '0.4px' }}>#{order.id}</span>
                          {order.itemCount > 1 && (
                            <span style={{ fontSize: '0.58rem', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-muted)' }}>+{order.itemCount - 1} items</span>
                          )}
                        </div>

                        {/* Product name */}
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', lineHeight: 1.3 }}>{order.product}</div>

                        {/* Customer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${stage.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={9} color={stage.color} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{order.customerName}</span>
                        </div>

                        {/* Address */}
                        {order.address && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                            <MapPin size={9} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{order.address}</span>
                          </div>
                        )}

                        {/* Price + payment + date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.1rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#fff' }}>₹{(order.total || 0).toLocaleString('en-IN')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '1px' }}>
                              <CreditCard size={8} color="var(--text-muted)" />
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{paymentLabel(order.paymentMethod)}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{order.date}</span>
                        </div>
                      </div>

                      {/* Action footer */}
                      <div style={{ display: 'flex', borderTop: `1px solid ${stage.border}`, background: stage.bg }}>
                        {!isFirst && (
                          <button
                            onClick={() => moveOrder(order.id, 'revert')}
                            disabled={moving === order.id}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
                              padding: '0.42rem', border: 'none', borderRight: '1px solid rgba(255,255,255,0.05)',
                              background: 'transparent', color: 'var(--text-muted)',
                              cursor: moving === order.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.65rem', fontWeight: '600', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            {moving === order.id ? <RefreshCw size={10} className="animate-spin" /> : <><ChevronLeft size={10} />Back</>}
                          </button>
                        )}
                        {!isLast ? (
                          <button
                            onClick={() => moveOrder(order.id, 'advance')}
                            disabled={moving === order.id}
                            style={{
                              flex: isFirst ? 1 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
                              padding: '0.42rem', border: 'none',
                              background: 'transparent', color: stage.color,
                              cursor: moving === order.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.68rem', fontWeight: '700', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${stage.color}18`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            {moving === order.id ? <RefreshCw size={10} className="animate-spin" /> : <><ChevronRight size={10} />Advance</>}
                          </button>
                        ) : (
                          <div style={{ flex: 1, textAlign: 'center', padding: '0.42rem', fontSize: '0.62rem', color: 'var(--text-muted)' }}>✓ Final Stage</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

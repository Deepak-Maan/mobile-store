import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { Bell, ShoppingCart, AlertTriangle, ShieldAlert, Package, CheckCheck, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  order:    { icon: ShoppingCart, color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  stock:    { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)'  },
  security: { icon: ShieldAlert,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
};

const SEVERITY_DOT = {
  info:     '#6366f1',
  warning:  '#f59e0b',
  critical: '#ef4444',
};

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'order',    label: '🛒 Orders' },
  { key: 'stock',    label: '⚠️ Stock' },
  { key: 'security', label: '🔐 Security' },
];

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return iso;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
};

export const NotificationsTab = () => {
  const { addToast } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dismissing, setDismissing] = useState(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silent fail on poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const dismiss = async (id) => {
    setDismissing(id);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      await fetch('/api/admin/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      addToast('Failed to dismiss notification.', 'error');
    } finally {
      setDismissing(null);
    }
  };

  const dismissAll = async () => {
    const token = sessionStorage.getItem('mobile_store_admin_token');
    const ids = filtered.map(n => n.id);
    try {
      await fetch('/api/admin/notifications/dismiss-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      addToast('All notifications cleared.', 'success');
    } catch {
      addToast('Failed to clear notifications.', 'error');
    }
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)', gap: '0.75rem' }}>
        <RefreshCw size={22} className="animate-spin" />
        <span style={{ fontSize: '0.85rem' }}>Loading notification feed…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', position: 'relative' }}>
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: '800', borderRadius: '999px', padding: '2px 5px', minWidth: '18px', textAlign: 'center', lineHeight: 1.4 }}>
                {notifications.length > 99 ? '99+' : notifications.length}
              </span>
            )}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#fff', margin: 0 }}>
              Alert Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.1rem 0 0 0' }}>
              {notifications.length} active alert{notifications.length !== 1 ? 's' : ''} — auto-refreshes every 10s
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => fetchNotifications()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          {filtered.length > 0 && (
            <button
              onClick={dismissAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}
            >
              <CheckCheck size={13} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const count = f.key === 'all' ? notifications.length : notifications.filter(n => n.type === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                border: filter === f.key ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: filter === f.key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                color: filter === f.key ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              {f.label} {count > 0 && <span style={{ marginLeft: '4px', background: filter === f.key ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: filter === f.key ? '#fff' : 'var(--text-secondary)', borderRadius: '999px', padding: '1px 6px', fontSize: '0.68rem' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Notification Feed */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--text-muted)' }}
        >
          <div style={{ fontSize: '3rem' }}>✅</div>
          <div style={{ fontWeight: '700', color: 'var(--text-secondary)', fontSize: '1rem' }}>All Clear!</div>
          <div style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: '240px', lineHeight: 1.6 }}>No active alerts in this category. Everything looks healthy.</div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {filtered.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.order;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                    padding: '1rem 1.1rem', borderRadius: '12px',
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {/* Severity strip */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: SEVERITY_DOT[notif.severity] || cfg.color, borderRadius: '3px 0 0 3px' }} />

                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '4px' }}>
                    <Icon size={16} color={cfg.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>{notif.title}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>{timeAgo(notif.time)}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{notif.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: SEVERITY_DOT[notif.severity] || cfg.color }} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{notif.severity}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => dismiss(notif.id)}
                    disabled={dismissing === notif.id}
                    style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    title="Dismiss"
                  >
                    {dismissing === notif.id ? <RefreshCw size={12} className="animate-spin" /> : <X size={12} />}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

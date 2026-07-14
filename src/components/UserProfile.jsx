import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, TrendingUp, Package, Award, Truck } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { ProductImage } from './ProductImage';

const statusColor = {
  delivered: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  shipped:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  text: '#3b82f6' },
  processing:{ bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  text: '#f97316' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
};

const getStatusStyle = (status = '') => statusColor[status.toLowerCase()] || statusColor.processing;

export const UserProfile = () => {
  const { currentUser, orders, wishlist, products, switchView, setTrackingOrderId } = useStore();

  const userOrders = useMemo(() =>
    orders.filter(o => o.userEmail === currentUser?.email || o.customerId === currentUser?.id)
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
  , [orders, currentUser]);

  const stats = useMemo(() => {
    const totalSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0);
    const brandCount = {};
    userOrders.forEach(o => (o.items || []).forEach(item => {
      const brand = item.brand || products.find(p => p.id === item.productId)?.brand || 'Unknown';
      brandCount[brand] = (brandCount[brand] || 0) + item.quantity;
    }));
    const favBrand = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return { totalSpent, favBrand, totalOrders: userOrders.length };
  }, [userOrders, products]);

  const wishlistProducts = useMemo(() =>
    wishlist.slice(0, 4).map(id => products.find(p => p.id === id)).filter(Boolean)
  , [wishlist, products]);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <User size={52} color="var(--primary)" opacity={0.5} />
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Please sign in to view your profile</p>
      </div>
    );
  }

  const initials = `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const joinYear = currentUser.createdAt
    ? new Date(currentUser.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* ── Hero Header ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '20px',
          padding: '2rem 2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.8rem',
          marginBottom: '1.8rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.9rem', fontWeight: 900, color: '#fff', flexShrink: 0,
          boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{currentUser.email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem' }}>
            <Award size={13} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Member since {joinYear}</span>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Stats ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
        {[
          { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: '#6366f1' },
          { icon: TrendingUp,  label: 'Total Spent',  value: formatINR(stats.totalSpent), color: '#8b5cf6' },
          { icon: Award,       label: 'Fav Brand',    value: stats.favBrand, color: '#ec4899' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            style={{
              flex: '1 1 180px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.3rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${kpi.color}22`, border: `1px solid ${kpi.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.69rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.22rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Recent Orders ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
          <Package size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Recent Orders</span>
        </div>

        {userOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.85rem' }}>No orders yet. Start shopping!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {userOrders.slice(0, 5).map((order, i) => {
              const style = getStatusStyle(order.status);
              const date = order.createdAt || order.date;
              const dateStr = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>#{String(order.id).slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dateStr} · {order.items?.length || 0} item(s)</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '99px', background: style.bg, border: `1px solid ${style.border}`, color: style.text, textTransform: 'capitalize', flexShrink: 0 }}>
                    {order.status || 'Processing'}
                  </span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {formatINR(order.total || 0)}
                  </div>
                  <button
                    onClick={() => { setTrackingOrderId(order.id); switchView('tracking'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '0.35rem 0.7rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                  >
                    <Truck size={12} />
                    Track
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Wishlist Snapshot ──────────────────────────── */}
      {wishlistProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
            <Heart size={15} color="#ef4444" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Wishlist Snapshot</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
            {wishlistProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.44 + i * 0.06 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}
              >
                <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem' }}>
                  <ProductImage src={p.images?.[0]} alt={p.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '0.7rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700 }}>{formatINR(p.price)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

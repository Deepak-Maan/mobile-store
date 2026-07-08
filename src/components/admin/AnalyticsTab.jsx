import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, AlertTriangle, BarChart2 } from 'lucide-react';
import { formatINR } from '../../utils/currency';

/* ── Helpers ─────────────────────────────────────────────── */
const cardStyle = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '1.4rem 1.6rem',
};

const KpiCard = ({ icon: Icon, label, value, sub, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.35 }}
    style={{
      ...cardStyle,
      display: 'flex',
      alignItems: 'center',
      gap: '1.1rem',
      flex: '1 1 200px',
      minWidth: '180px'
    }}
  >
    <div style={{
      width: '46px', height: '46px', borderRadius: '12px',
      background: `${color}22`,
      border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  </motion.div>
);

/* ── Revenue Bar Chart (SVG-based) ─────────────────────────── */
const RevenueChart = ({ dailyData }) => {
  const maxVal = Math.max(...dailyData.map(d => d.revenue), 1);
  const chartH = 110;
  const barW = 28;
  const gap = 12;
  const totalW = dailyData.length * (barW + gap) - gap;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
        <BarChart2 size={15} color="var(--primary)" />
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Revenue – Last 7 Days</span>
      </div>
      {dailyData.every(d => d.revenue === 0) ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>No revenue data yet</div>
      ) : (
        <svg width="100%" viewBox={`0 0 ${totalW + 20} ${chartH + 36}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {dailyData.map((d, i) => {
            const x = i * (barW + gap);
            const barH = maxVal > 0 ? (d.revenue / maxVal) * chartH : 0;
            const y = chartH - barH;
            return (
              <g key={d.label}>
                {/* Background rail */}
                <rect x={x} y={0} width={barW} height={chartH} rx={6} fill="rgba(255,255,255,0.03)" />
                {/* Value bar */}
                <motion.rect
                  x={x} y={y} width={barW} height={barH} rx={6}
                  fill="url(#bar-grad)"
                  initial={{ height: 0, y: chartH }}
                  animate={{ height: barH, y }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                />
                {/* Day label */}
                <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">{d.label}</text>
                {/* Value label */}
                {d.revenue > 0 && (
                  <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill="var(--primary)" fontWeight="700">
                    {d.revenue >= 100000 ? `${(d.revenue / 100000).toFixed(1)}L` : d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(0)}k` : d.revenue}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
export const AnalyticsTab = () => {
  const { orders, products, registeredUsers } = useStore();

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalUsers = (registeredUsers || []).length;

    // Brand revenue breakdown
    const brandRevenue = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const brand = prod?.brand || item.brand || 'Other';
        brandRevenue[brand] = (brandRevenue[brand] || 0) + (item.price * item.quantity);
      });
    });

    // Top products by units sold
    const productSales = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = item.productId || item.name;
        if (!productSales[key]) {
          const prod = products.find(p => p.id === item.productId);
          productSales[key] = { name: item.name || prod?.name || 'Unknown', brand: item.brand || prod?.brand, units: 0, revenue: 0 };
        }
        productSales[key].units += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.units - a.units).slice(0, 6);

    // Last 7 days revenue
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const label = days[d.getDay()];
      const dateStr = d.toISOString().slice(0, 10);
      const revenue = orders
        .filter(o => (o.createdAt || o.date || '').slice(0, 10) === dateStr)
        .reduce((s, o) => s + (o.total || 0), 0);
      return { label, revenue };
    });

    // Low stock products
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 3);
    const outOfStock = products.filter(p => p.stock === 0);

    return { totalRevenue, totalOrders, avgOrderValue, totalUsers, brandRevenue, topProducts, dailyData, lowStock, outOfStock };
  }, [orders, products, registeredUsers]);

  const brandEntries = Object.entries(stats.brandRevenue).sort((a, b) => b[1] - a[1]);
  const maxBrandRev = brandEntries.length > 0 ? brandEntries[0][1] : 1;

  const brandColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.8rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Sales Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>Live insights from all orders and inventory</p>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard index={0} icon={DollarSign} label="Total Revenue" value={formatINR(stats.totalRevenue)} color="#6366f1" />
        <KpiCard index={1} icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="#8b5cf6" />
        <KpiCard index={2} icon={TrendingUp} label="Avg Order Value" value={formatINR(Math.round(stats.avgOrderValue))} color="#ec4899" />
        <KpiCard index={3} icon={Users} label="Registered Users" value={stats.totalUsers} color="#10b981" />
      </div>

      {/* Revenue Chart + Brand Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...cardStyle }}>
          <RevenueChart dailyData={stats.dailyData} />
        </motion.div>

        {/* Brand Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.2rem' }}>
            <TrendingUp size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Revenue by Brand</span>
          </div>
          {brandEntries.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {brandEntries.slice(0, 6).map(([brand, rev], i) => (
                <div key={brand}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{brand}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatINR(rev)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(rev / maxBrandRev) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', background: brandColors[i % brandColors.length], borderRadius: '99px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Products + Stock Warnings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.2rem' }}>
        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.2rem' }}>
            <Package size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top Selling Products</span>
          </div>
          {stats.topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.85rem' }}>No sales data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {stats.topProducts.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : i === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(180,120,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>{p.units} sold</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatINR(p.revenue)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stock Warnings */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.2rem' }}>
            <AlertTriangle size={15} color="#f97316" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Stock Warnings</span>
          </div>
          {stats.outOfStock.length === 0 && stats.lowStock.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#10b981', padding: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>✓ All products well-stocked</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.outOfStock.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>OUT OF STOCK</span>
                </div>
              ))}
              {stats.lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f97316', background: 'rgba(249,115,22,0.15)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>⚠ {p.stock} LEFT</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

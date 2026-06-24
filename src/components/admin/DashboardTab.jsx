import React from 'react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Smartphone, AlertCircle } from 'lucide-react';

export const DashboardTab = () => {
  const { products, orders } = useStore();

  // 1. Calculate General Numbers
  const nonCancelledOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrdersCount = orders.length;
  const uniqueDevicesCount = products.length;
  const lowStockAlertsCount = products.filter((p) => p.stock < 5).length;

  // 2. Animate Monthly Sales Bar Chart
  // Jun is representing "live" simulation from the website orders placed in the current session
  const maxRepresented = 10000;
  const heightPercent = Math.min(100, (totalRevenue / maxRepresented) * 100);

  // 3. Brand Sales distribution
  const brandCounts = { Apple: 0, Samsung: 0, Google: 0, OnePlus: 0, Xiaomi: 0 };
  let totalUnitsSold = 0;

  nonCancelledOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (brandCounts[item.brand] !== undefined) {
        brandCounts[item.brand] += item.quantity;
        totalUnitsSold += item.quantity;
      }
    });
  });

  const sortedBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="admin-panel active" id="admin-panel-dashboard">
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <h2>Dashboard Summary</h2>
          <p>Real-time analytics of your store inventory and sales revenue.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card" id="stat-total-revenue">
          <div className="stat-icon-box green">
            <DollarSign width="24" height="24" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value" id="stat-val-revenue">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className="stat-card" id="stat-total-orders">
          <div className="stat-icon-box blue">
            <ShoppingCart width="24" height="24" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value" id="stat-val-orders">{totalOrdersCount}</span>
          </div>
        </div>
        
        <div className="stat-card" id="stat-total-products">
          <div className="stat-icon-box pink">
            <Smartphone width="24" height="24" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Unique Devices</span>
            <span className="stat-value" id="stat-val-devices">{uniqueDevicesCount}</span>
          </div>
        </div>
        
        <div className="stat-card" id="stat-low-stock">
          <div 
            className="stat-icon-box"
            style={{
              color: lowStockAlertsCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
              backgroundColor: lowStockAlertsCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
            }}
          >
            <AlertCircle width="24" height="24" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Alerts</span>
            <span className="stat-value" id="stat-val-lowstock">{lowStockAlertsCount}</span>
          </div>
        </div>
      </div>

      {/* Charts and Brand Share */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Monthly Performance Simulation</h3>
          <div className="sales-chart" id="dashboard-sales-chart">
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '40%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>$1.2K</span>
                </div>
              </div>
              <span className="chart-label">Feb</span>
            </div>
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '65%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>$3.8K</span>
                </div>
              </div>
              <span className="chart-label">Mar</span>
            </div>
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '55%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>$2.9K</span>
                </div>
              </div>
              <span className="chart-label">Apr</span>
            </div>
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '85%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>$5.4K</span>
                </div>
              </div>
              <span className="chart-label">May</span>
            </div>
            
            {/* Live Session Bar (Animated on Mount!) */}
            <div className="chart-column">
              <div className="chart-bar-container">
                <motion.div 
                  initial={{ height: '0%' }}
                  animate={{ height: `${Math.max(8, heightPercent)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="chart-bar" 
                  id="current-month-bar"
                >
                  <span className="chart-bar-value" id="current-month-val" style={{ opacity: 1 }}>
                    ${(totalRevenue / 1000).toFixed(1)}K
                  </span>
                </motion.div>
              </div>
              <span className="chart-label">Jun (Now)</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Popular Brands Share</h3>
          <div className="top-brands-list" id="dashboard-brand-list">
            {totalUnitsSold === 0 ? (
              <div className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>
                No sales recorded yet.
              </div>
            ) : (
              sortedBrands.map(([brand, count]) => {
                const percentage = totalUnitsSold > 0 ? Math.round((count / totalUnitsSold) * 100) : 0;
                return (
                  <div className="brand-progress-item" key={brand}>
                    <div className="brand-progress-header">
                      <span>{brand}</span>
                      <span>{count} sold ({percentage}%)</span>
                    </div>
                    <div className="brand-progress-bar-bg">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="brand-progress-bar-fill" 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, Smartphone, AlertCircle } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const DashboardTab = () => {
  const { products, orders, backupDatabase, restoreDatabase } = useStore();
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const confirmRestore = window.confirm("WARNING: Restoring the database will overwrite all inventory products, customer accounts, and order history records with the backup file data. Are you sure you want to proceed?");
        if (confirmRestore) {
          await restoreDatabase(json);
        }
      } catch (err) {
        alert("Invalid file: Failed to parse JSON database backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
            <IndianRupee width="24" height="24" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value" id="stat-val-revenue">
              {formatINR(totalRevenue)}
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
                  <span className="chart-bar-value" style={{ opacity: 1 }}>₹102K</span>
                </div>
              </div>
              <span className="chart-label">Feb</span>
            </div>
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '65%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>₹323K</span>
                </div>
              </div>
              <span className="chart-label">Mar</span>
            </div>
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '55%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>₹247K</span>
                </div>
              </div>
              <span className="chart-label">Apr</span>
            </div>
            <div className="chart-column">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ height: '85%' }}>
                  <span className="chart-bar-value" style={{ opacity: 1 }}>₹459K</span>
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
                    ₹{Math.round(totalRevenue / 1000)}K
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

      {/* Database Maintenance Section */}
      <div 
        className="chart-card" 
        style={{ 
          marginTop: '1.5rem', 
          background: 'rgba(99, 102, 241, 0.03)', 
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h3 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
            Administrative Database Maintenance
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Safely download backups or restore database entities (products, user records, and invoices).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button 
            className="admin-filter-btn" 
            onClick={backupDatabase}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', fontWeight: '600' }}
          >
            Download Database Backup
          </button>
          
          <button 
            className="admin-filter-btn" 
            onClick={() => fileInputRef.current.click()}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', fontWeight: '600' }}
          >
            Upload Backup File
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { LayoutDashboard, Smartphone, ClipboardList, Users, LogOut, BarChart2, Shield, Lock, Activity, Bell, KanbanSquare, Globe } from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { InventoryTab } from './InventoryTab';
import { OrdersTab } from './OrdersTab';
import { UsersTab } from './UsersTab';
import { AnalyticsTab } from './AnalyticsTab';
import { LogsTab } from './LogsTab';
import { SecurityTab } from './SecurityTab';
import { SystemTab } from './SystemTab';
import { NotificationsTab } from './NotificationsTab';
import { FulfillmentTab } from './FulfillmentTab';
import { VisitorsTab } from './VisitorsTab';

export const AdminLayout = () => {
  const { adminPanel, switchAdminPanel, logoutAdmin } = useStore();
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [visitorCount,  setVisitorCount]  = useState(0);

  // Poll unread notification count + live visitor count every 10s
  useEffect(() => {
    const token = sessionStorage.getItem('mobile_store_admin_token');
    if (!token) return;

    const fetchCounts = async () => {
      try {
        const [nRes, vRes] = await Promise.all([
          fetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/visitors',      { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (nRes.ok) { const d = await nRes.json(); setUnreadCount(d.unreadCount  || 0); }
        if (vRes.ok) { const d = await vRes.json(); setVisitorCount(d.total || 0); }
      } catch { /* silent */ }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="admin-view" className="view-section active">
      <div className="admin-shell">
        {/* Admin Sidebar */}
        <aside className="admin-sidebar" id="admin-panel-sidebar">
          <div className="admin-menu-title">Control Hub</div>
          <ul className="admin-menu-list" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'dashboard' ? 'active' : ''}`} id="admin-menu-dashboard" onClick={() => switchAdminPanel('dashboard')}>
                <LayoutDashboard width="18" height="18" />
                Dashboard
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'analytics' ? 'active' : ''}`} id="admin-menu-analytics" onClick={() => switchAdminPanel('analytics')}>
                <BarChart2 width="18" height="18" />
                Analytics
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'inventory' ? 'active' : ''}`} id="admin-menu-inventory" onClick={() => switchAdminPanel('inventory')}>
                <Smartphone width="18" height="18" />
                Inventory Manager
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'orders' ? 'active' : ''}`} id="admin-menu-orders" onClick={() => switchAdminPanel('orders')}>
                <ClipboardList width="18" height="18" />
                Order List
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'users' ? 'active' : ''}`} id="admin-menu-users" onClick={() => switchAdminPanel('users')}>
                <Users width="18" height="18" />
                Shoppers Manager
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'logs' ? 'active' : ''}`} id="admin-menu-logs" onClick={() => switchAdminPanel('logs')}>
                <Shield width="18" height="18" />
                Security Logs
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'security' ? 'active' : ''}`} id="admin-menu-security" onClick={() => switchAdminPanel('security')}>
                <Lock width="18" height="18" />
                Security Control
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'system' ? 'active' : ''}`} id="admin-menu-system" onClick={() => switchAdminPanel('system')}>
                <Activity width="18" height="18" />
                System Telemetry
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'notifications' ? 'active' : ''}`} id="admin-menu-notifications" onClick={() => { switchAdminPanel('notifications'); setUnreadCount(0); }} style={{ position: 'relative' }}>
                <Bell width="18" height="18" />
                Alert Center
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '6px', right: '10px', background: '#ef4444', color: '#fff', fontSize: '0.58rem', fontWeight: '800', borderRadius: '999px', padding: '1px 5px', minWidth: '16px', textAlign: 'center', lineHeight: 1.4 }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'fulfillment' ? 'active' : ''}`} id="admin-menu-fulfillment" onClick={() => switchAdminPanel('fulfillment')}>
                <KanbanSquare width="18" height="18" />
                Fulfillment Pipeline
              </button>
            </li>
            <li>
              <button className={`admin-menu-btn ${adminPanel === 'visitors' ? 'active' : ''}`} id="admin-menu-visitors" onClick={() => switchAdminPanel('visitors')} style={{ position: 'relative' }}>
                <Globe width="18" height="18" />
                Live Visitors
                {visitorCount > 0 && (
                  <span style={{ position: 'absolute', top: '6px', right: '10px', background: '#22c55e', color: '#000', fontSize: '0.58rem', fontWeight: '900', borderRadius: '999px', padding: '1px 5px', minWidth: '16px', textAlign: 'center', lineHeight: 1.4, boxShadow: '0 0 6px rgba(34,197,94,0.6)' }}>
                    {visitorCount}
                  </span>
                )}
              </button>
            </li>
            
            {/* Admin Session Logout */}
            <li style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button className="admin-menu-btn" style={{ color: 'var(--accent-red)' }} onClick={logoutAdmin}>
                <LogOut width="18" height="18" />
                Log Out
              </button>
            </li>
          </ul>
        </aside>
 
        {/* Admin Panels Main Area */}
        <main className="admin-content" id="admin-main-panel-content">
          {adminPanel === 'dashboard' && <DashboardTab />}
          {adminPanel === 'analytics' && <AnalyticsTab />}
          {adminPanel === 'inventory' && <InventoryTab />}
          {adminPanel === 'orders' && <OrdersTab />}
          {adminPanel === 'users' && <UsersTab />}
          {adminPanel === 'logs' && <LogsTab />}
          {adminPanel === 'security' && <SecurityTab />}
          {adminPanel === 'system' && <SystemTab />}
          {adminPanel === 'notifications' && <NotificationsTab />}
          {adminPanel === 'fulfillment' && <FulfillmentTab />}
          {adminPanel === 'visitors' && <VisitorsTab />}
        </main>
      </div>
    </section>
  );
};

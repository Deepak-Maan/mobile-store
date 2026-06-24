import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LayoutDashboard, Smartphone, ClipboardList, Users, LogOut } from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { InventoryTab } from './InventoryTab';
import { OrdersTab } from './OrdersTab';
import { UsersTab } from './UsersTab';

export const AdminLayout = () => {
  const { adminPanel, switchAdminPanel, logoutAdmin } = useStore();

  return (
    <section id="admin-view" className="view-section active">
      <div className="admin-shell">
        {/* Admin Sidebar */}
        <aside className="admin-sidebar" id="admin-panel-sidebar">
          <div className="admin-menu-title">Control Hub</div>
          <ul className="admin-menu-list" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <li>
              <button 
                className={`admin-menu-btn ${adminPanel === 'dashboard' ? 'active' : ''}`} 
                id="admin-menu-dashboard" 
                onClick={() => switchAdminPanel('dashboard')}
              >
                <LayoutDashboard width="18" height="18" />
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`admin-menu-btn ${adminPanel === 'inventory' ? 'active' : ''}`} 
                id="admin-menu-inventory" 
                onClick={() => switchAdminPanel('inventory')}
              >
                <Smartphone width="18" height="18" />
                Inventory Manager
              </button>
            </li>
            <li>
              <button 
                className={`admin-menu-btn ${adminPanel === 'orders' ? 'active' : ''}`} 
                id="admin-menu-orders" 
                onClick={() => switchAdminPanel('orders')}
              >
                <ClipboardList width="18" height="18" />
                Order List
              </button>
            </li>
            <li>
              <button 
                className={`admin-menu-btn ${adminPanel === 'users' ? 'active' : ''}`} 
                id="admin-menu-users" 
                onClick={() => switchAdminPanel('users')}
              >
                <Users width="18" height="18" />
                Shoppers Manager
              </button>
            </li>
            
            {/* Admin Session Logout */}
            <li style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button 
                className="admin-menu-btn" 
                style={{ color: 'var(--accent-red)' }}
                onClick={logoutAdmin}
              >
                <LogOut width="18" height="18" />
                Log Out
              </button>
            </li>
          </ul>
        </aside>
 
        {/* Admin Panels Main Area */}
        <main className="admin-content" id="admin-main-panel-content">
          {adminPanel === 'dashboard' && <DashboardTab />}
          {adminPanel === 'inventory' && <InventoryTab />}
          {adminPanel === 'orders' && <OrdersTab />}
          {adminPanel === 'users' && <UsersTab />}
        </main>
      </div>
    </section>
  );
};

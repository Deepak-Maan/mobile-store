import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Edit, UserCheck, UserX, Users, X, Save, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UsersTab = () => {
  const { registeredUsers, saveUser, toggleUserActive } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats
  const totalUsers = registeredUsers.length;
  const activeUsers = registeredUsers.filter((u) => u.isActive !== false).length;
  const deactivatedUsers = registeredUsers.filter((u) => u.isActive === false).length;

  // Filtered list
  const filteredUsers = registeredUsers.filter((user) => {
    const searchStr = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  const handleOpenEdit = (user) => {
    setEditingUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    saveUser(editingUser);
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="admin-panel active" id="admin-panel-users">
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <h2>User Account Manager</h2>
          <p>Oversee registered shoppers, update credentials, and manage active statuses.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
            <Users style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalUsers}</span>
            <span className="stat-label">Total Shoppers</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
            <UserCheck style={{ color: '#10b981' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: '#10b981' }}>{activeUsers}</span>
            <span className="stat-label">Active Profiles</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
            <UserX style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: 'var(--accent-red)' }}>{deactivatedUsers}</span>
            <span className="stat-label">Deactivated Profiles</span>
          </div>
        </div>
      </div>

      {/* Search and Filters bar */}
      <div className="controls-container" style={{ padding: '0.8rem 1.2rem', marginBottom: '1.2rem' }}>
        <div className="search-box" style={{ maxWidth: '400px', margin: 0 }}>
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <table className="admin-table" id="users-table">
          <thead>
            <tr>
              <th>Customer Shopper</th>
              <th>Email Account</th>
              <th>Security Key</th>
              <th>Profile Status</th>
              <th>Action Commands</th>
            </tr>
          </thead>
          <tbody id="users-table-body">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)', padding: '3rem' }}>
                  No shoppers found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isActive = user.isActive !== false;
                
                return (
                  <tr key={user.email} id={`user-row-${user.email.replace(/[@.]/g, '-')}`}>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                        {user.firstName} {user.lastName}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{user.email}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <Lock width="11" height="11" />
                        <span style={{ fontFamily: 'monospace' }}>••••••••</span>
                      </div>
                    </td>
                    <td>
                      <div className={`stock-indicator ${isActive ? 'in' : 'out'}`} style={{ display: 'inline-flex' }}>
                        <span className="stock-dot"></span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        {/* Edit User Button */}
                        <button
                          className="table-btn edit-btn"
                          title="Edit User details"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit width="15" height="15" />
                        </button>

                        {/* Toggle Active status Button */}
                        <button
                          className={`table-btn ${isActive ? 'delete-btn' : 'edit-btn'}`}
                          style={{
                            borderColor: isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                            color: isActive ? 'var(--accent-red)' : '#10b981',
                            backgroundColor: isActive ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)'
                          }}
                          title={isActive ? 'Deactivate User Account' : 'Activate User Account'}
                          onClick={() => toggleUserActive(user.email)}
                        >
                          {isActive ? <UserX width="15" height="15" /> : <UserCheck width="15" height="15" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Details Modal */}
      <AnimatePresence>
        {isModalOpen && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="form-modal-overlay"
            id="user-edit-overlay"
            onClick={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}
            style={{ display: 'flex' }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              className="form-modal-container"
              style={{ maxWidth: '560px', padding: '1.5rem 2rem', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-modal-header" style={{ marginBottom: '0.8rem', paddingBottom: '0.4rem' }}>
                <h3 style={{ margin: 0 }}>Edit Shopper: {editingUser.firstName}</h3>
                <button
                  className="form-modal-close"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                  }}
                  style={{ width: '30px', height: '30px' }}
                >
                  <X width="14" height="14" strokeWidth={2.5} />
                </button>
              </div>

              <form className="checkout-form" onSubmit={handleModalSubmit} style={{ marginTop: '0.4rem', gap: '0.8rem' }}>
                <div className="form-group-row" style={{ gap: '0.8rem' }}>
                  <div className="form-group">
                    <label htmlFor="edit-user-first" style={{ fontSize: '0.75rem' }}>First Name</label>
                    <input
                      type="text"
                      id="edit-user-first"
                      name="firstName"
                      value={editingUser.firstName}
                      onChange={handleModalInputChange}
                      required
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-user-last" style={{ fontSize: '0.75rem' }}>Last Name</label>
                    <input
                      type="text"
                      id="edit-user-last"
                      name="lastName"
                      value={editingUser.lastName}
                      onChange={handleModalInputChange}
                      required
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-email" style={{ fontSize: '0.75rem' }}>Email Address</label>
                  <input
                    type="email"
                    id="edit-user-email"
                    name="email"
                    value={editingUser.email}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed', padding: '0.6rem 0.8rem', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'block' }}>
                    Email address cannot be changed.
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-password" style={{ fontSize: '0.75rem' }}>Password / Credentials</label>
                  <input
                    type="text"
                    id="edit-user-password"
                    name="password"
                    value={editingUser.password}
                    onChange={handleModalInputChange}
                    required
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.88rem' }}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="edit-user-status"
                    name="isActive"
                    checked={editingUser.isActive}
                    onChange={handleModalInputChange}
                    style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }}
                  />
                  <label htmlFor="edit-user-status" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    Account is Active (shopper can sign in)
                  </label>
                </div>

                <div className="form-modal-footer" style={{ marginTop: '1.2rem' }}>
                  <button
                    type="button"
                    className="form-modal-btn cancel"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                    }}
                    style={{ padding: '0.6rem 1.4rem', fontSize: '0.88rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="form-modal-btn save"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.4rem', fontSize: '0.88rem' }}
                  >
                    <Save width="14" height="14" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { Shield, Search, RefreshCw, Terminal, Clock } from 'lucide-react';

export const LogsTab = () => {
  const { addToast } = useStore();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      } else {
        addToast('Failed to load security audit logs.', 'error');
      }
    } catch {
      addToast('Server connection error while loading audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (!log) return false;
    const action = log.action || '';
    const details = log.details || '';
    const user = log.user || '';
    const ip = log.ipAddress || '';

    const matchesSearch = 
      action.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase()) ||
      user.toLowerCase().includes(search.toLowerCase()) ||
      ip.includes(search);
      
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'AUTH') return matchesSearch && (action.startsWith('ADMIN_LOGIN') || action.startsWith('USER'));
    if (filterType === 'DATABASE') return matchesSearch && action.startsWith('DATABASE');
    if (filterType === 'CATALOG') return matchesSearch && action.startsWith('PRODUCT');
    if (filterType === 'ORDERS') return matchesSearch && action.startsWith('ORDER');
    return matchesSearch;
  });

  const getActionBadge = (action = '') => {
    let color = 'rgba(255, 255, 255, 0.08)';
    let textColor = '#cbd5e1';
    let label = action;

    if (action === 'ADMIN_LOGIN') {
      color = 'rgba(16, 185, 129, 0.1)';
      textColor = '#10b981';
      label = 'LOGIN SUCCESS';
    } else if (action === 'ADMIN_LOGIN_FAIL') {
      color = 'rgba(244, 63, 94, 0.1)';
      textColor = '#f43f5e';
      label = 'LOGIN ATTEMPT BLOCKED';
    } else if (action.startsWith('PRODUCT_')) {
      color = 'rgba(139, 92, 246, 0.1)';
      textColor = '#a78bfa';
      label = action.replace('PRODUCT_', '');
    } else if (action.startsWith('DATABASE_')) {
      color = 'rgba(245, 158, 11, 0.1)';
      textColor = '#f59e0b';
      label = action.replace('DATABASE_', '');
    } else if (action.startsWith('ORDER_')) {
      color = 'rgba(59, 130, 246, 0.1)';
      textColor = '#60a5fa';
      label = action.replace('ORDER_', '');
    } else if (action.startsWith('USER_')) {
      color = 'rgba(236, 72, 153, 0.1)';
      textColor = '#f472b6';
      label = action.replace('USER_', '');
    }

    return (
      <span style={{
        padding: '0.25rem 0.65rem',
        borderRadius: '20px',
        fontSize: '0.65rem',
        fontWeight: '800',
        backgroundColor: color,
        color: textColor,
        border: `1px solid ${textColor}22`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        display: 'inline-block'
      }}>
        {label}
      </span>
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="admin-panel active" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="admin-panel-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Shield size={24} color="#6366f1" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Security Audit Log</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Real-time tamper logs, admin credentials actions, and database modifications.</p>
        </div>
        
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="admin-filter-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', color: '#fff',
            border: '1px solid var(--border-color)', fontWeight: '600',
            fontSize: '0.82rem'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1rem',
        alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)',
        padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search action, details, operator, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{
              width: '100%', padding: '0.55rem 1rem 0.55rem 2.4rem',
              fontSize: '0.85rem', height: '38px'
            }}
          />
        </div>

        {/* Action Type Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Operations' },
            { id: 'AUTH', label: 'Access Checks' },
            { id: 'CATALOG', label: 'Catalog Updates' },
            { id: 'ORDERS', label: 'Orders Modifies' },
            { id: 'DATABASE', label: 'DB Backups' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem',
                fontWeight: '600', cursor: 'pointer',
                background: filterType === f.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: filterType === f.id ? '#818cf8' : 'var(--text-secondary)',
                border: `1px solid ${filterType === f.id ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
                transition: 'all 0.2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Registry Table */}
      <div style={{
        background: 'rgba(5, 5, 8, 0.5)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {loading && logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            Retrieving secure logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Terminal size={24} style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
            No matching log entries found in secure enclaves.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', width: '160px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={12} /> Timestamp</div>
                  </th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', width: '170px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Shield size={12} /> Event Type</div>
                  </th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Details</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', width: '120px' }}>Operator</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', width: '110px' }}>Source IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      background: log.action === 'ADMIN_LOGIN_FAIL' ? 'rgba(244,63,94,0.015)' : 'none',
                      transition: 'background 0.2s'
                    }}
                    className="hover-row"
                  >
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {formatDate(log.timestamp)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '1rem', color: '#fff', lineHeight: 1.45, fontWeight: 500 }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                      {log.user}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                      <div>{log.ipAddress}</div>
                      {log.location && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 'normal', fontFamily: 'sans-serif' }}>
                          📍 {log.location}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

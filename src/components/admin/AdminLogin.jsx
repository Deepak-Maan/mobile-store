import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, Lock, User, ArrowLeft } from 'lucide-react';

export const AdminLogin = () => {
  const { loginAdmin, switchView } = useStore();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginAdmin(form.username, form.password);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 140px)', padding: '2rem' }}>
      <div className="checkout-card" style={{ maxWidth: '400px', width: '100%', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'linear-gradient(135deg, rgba(25, 25, 32, 0.9), rgba(15, 15, 20, 0.95))' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '2px solid rgba(99, 102, 241, 0.2)', width: '64px', height: '64px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem', boxShadow: '0 0 15px var(--primary-glow)' }}>
            <ShieldAlert width="32" height="32" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#fff' }}>Admin Access</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            Authorized personnel only. Please input credentials to unlock control panel.
          </p>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit} style={{ gap: '1.2rem' }}>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <div style={{ position: 'relative' }}>
              <User width="16" height="16" style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                id="admin-username"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                required
                placeholder="admin"
                style={{ paddingLeft: '2.6rem', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="admin-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock width="16" height="16" style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="admin-password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                style={{ paddingLeft: '2.6rem', width: '100%' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="checkout-btn" 
            style={{ padding: '0.9rem', marginTop: '0.5rem' }}
          >
            Unlock Control Hub
          </button>
        </form>

        <button
          type="button"
          onClick={() => switchView('storefront')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', margin: '1.5rem auto 0 auto', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
        >
          <ArrowLeft width="14" height="14" />
          Return to public storefront
        </button>

      </div>
    </div>
  );
};

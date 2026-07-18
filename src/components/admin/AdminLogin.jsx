import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, Lock, User, ArrowLeft, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLogin = () => {
  const { loginAdmin, verifyAdmin2FA, switchView } = useStore();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  
  const [show2FA, setShow2FA] = useState(false);
  const [code2FA, setCode2FA] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    const res = await loginAdmin(form.username, form.password);
    setLoading(false);
    
    if (res.success) {
      if (res.require2FA) {
        setShow2FA(true);
      }
    } else {
      setErrorMsg(res.error || 'Invalid administrator credentials.');
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    const res = await verifyAdmin2FA(form.username, code2FA);
    setLoading(false);
    
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid 2FA code.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 140px)', padding: '2rem' }}>
      <div className="checkout-card" style={{ maxWidth: '400px', width: '100%', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'linear-gradient(135deg, rgba(25, 25, 32, 0.9), rgba(15, 15, 20, 0.95))', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '2px solid rgba(99, 102, 241, 0.2)', width: '64px', height: '64px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem', boxShadow: '0 0 15px var(--primary-glow)' }}>
            {show2FA ? <KeyRound width="32" height="32" /> : <ShieldAlert width="32" height="32" />}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#fff' }}>
            {show2FA ? '2-Factor Authentication' : 'Admin Access'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            {show2FA 
              ? 'Enter the 6-digit passcode from your Authenticator app.'
              : 'Authorized personnel only. Please input credentials to unlock control panel.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px', padding: '0.75rem 1rem', color: '#fca5a5',
            fontSize: '0.82rem', marginBottom: '1.2rem', textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!show2FA ? (
            <motion.form 
              key="password-step"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="checkout-form" 
              onSubmit={handlePasswordSubmit} 
              style={{ gap: '1.2rem' }}
            >
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
                    disabled={loading}
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
                    disabled={loading}
                    style={{ paddingLeft: '2.6rem', width: '100%' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="checkout-btn" 
                disabled={loading}
                style={{ padding: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading ? 'Verifying...' : 'Unlock Control Hub'}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="2fa-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="checkout-form" 
              onSubmit={handle2FASubmit} 
              style={{ gap: '1.2rem' }}
            >
              <div className="form-group">
                <label htmlFor="admin-2fa-code">6-Digit Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound width="16" height="16" style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="admin-2fa-code"
                    name="code"
                    value={code2FA}
                    onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="123456"
                    disabled={loading}
                    style={{ paddingLeft: '2.6rem', width: '100%', letterSpacing: '8px', fontSize: '1.2rem', textAlign: 'center', fontWeight: '800' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Tip: Use simulator code <strong style={{ color: 'var(--primary)' }}>123456</strong>
                </div>
              </div>

              <button 
                type="submit" 
                className="checkout-btn" 
                disabled={loading}
                style={{ padding: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading ? 'Authenticating...' : 'Verify Code'}
              </button>
              
              <button
                type="button"
                onClick={() => { setShow2FA(false); setCode2FA(''); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', fontWeight: 600 }}
              >
                Back to Password Login
              </button>
            </motion.form>
          )}
        </AnimatePresence>

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

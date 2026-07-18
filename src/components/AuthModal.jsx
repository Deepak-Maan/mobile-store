import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, Lock, Mail } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { signUpUser, loginUser } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      const success = signUpUser(form);
      if (success) {
        handleClose();
      }
    } else {
      const success = loginUser(form.email, form.password);
      if (success) {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    // Reset form states
    setForm({ firstName: '', lastName: '', email: '', password: '' });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'auth-modal-overlay') {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="form-modal-overlay"
          id="auth-modal-overlay"
          onClick={handleOverlayClick}
          style={{ display: 'flex', zIndex: 220 }} // Ensure it overlays the cart drawer
        >
          <motion.div
            initial={{ scale: 0.94, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="form-modal-container"
            style={{ maxWidth: '600px', padding: '2.2rem', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="form-modal-header" style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h3>
              <button 
                className="form-modal-close" 
                onClick={handleClose}
              >
                <X width="16" height="16" strokeWidth={2.5} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.8rem' }}>
              {isSignUp 
                ? 'Register to save your shipping details and monitor order histories.' 
                : 'Sign in to access your premium smartphone purchase ledger.'}
            </p>

            <form className="checkout-form" onSubmit={handleSubmit} style={{ gap: '1rem' }}>
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div className="form-group-row">
                      <div className="form-group">
                        <label htmlFor="auth-firstName">First Name</label>
                        <input
                          type="text"
                          id="auth-firstName"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleInputChange}
                          required={isSignUp}
                          placeholder="John"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="auth-lastName">Last Name</label>
                        <input
                          type="text"
                          id="auth-lastName"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleInputChange}
                          required={isSignUp}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail width="16" height="16" style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    id="auth-email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john.doe@example.com"
                    style={{ paddingLeft: '2.6rem', width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="auth-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock width="16" height="16" style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="auth-password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.6rem', width: '100%' }}
                  />
                </div>
                {isSignUp && form.password && (() => {
                  // Password entropy calculator
                  const pwd = form.password;
                  let score = 0;
                  if (pwd.length >= 8) score += 25;
                  if (/[A-Z]/.test(pwd)) score += 20;
                  if (/[a-z]/.test(pwd)) score += 20;
                  if (/[0-9]/.test(pwd)) score += 20;
                  if (/[^A-Za-z0-9]/.test(pwd)) score += 15;
                  
                  let text = 'Weak 🔴';
                  let color = '#ef4444';
                  if (score >= 40 && score < 70) {
                    text = 'Medium 🟠';
                    color = '#f97316';
                  } else if (score >= 70 && score < 90) {
                    text = 'Strong 🟢';
                    color = '#22c55e';
                  } else if (score >= 90) {
                    text = 'Hacker-Proof ⚡';
                    color = '#06b6d4';
                  }
                  
                  return (
                    <div style={{ marginTop: '0.45rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                        <span>Password Strength:</span>
                        <span style={{ color, fontWeight: 700 }}>{text}</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: color, transition: 'all 0.35s ease' }} />
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button 
                type="submit" 
                className="checkout-btn" 
                style={{ marginTop: '0.8rem', padding: '0.85rem' }}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

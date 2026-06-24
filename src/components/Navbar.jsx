import React from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Smartphone, ShoppingBag, ShoppingCart, LogIn, LogOut, User, Shield } from 'lucide-react';

export const Navbar = ({ onOpenCart, onOpenAuth }) => {
  const { currentView, switchView, cart, currentUser, logoutUser, isAdminLoggedIn } = useStore();

  const totalQty = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar-container">
        <a href="#" className="nav-brand" id="nav-logo-link" onClick={(e) => { e.preventDefault(); switchView('storefront'); }}>
          <div className="brand-icon">
            <Smartphone style={{ color: '#fff', width: '20px', height: '20px' }} />
          </div>
          <span className="brand-name">AURA</span>
        </a>

        <div className="nav-links">
          {isAdminLoggedIn ? (
            /* Admin Mode Badge (Hides all shopping controls) */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', color: '#a5b4fc', fontSize: '0.88rem', fontWeight: 600 }}>
              <Shield width="15" height="15" />
              Admin Control Mode
            </div>
          ) : (
            /* Standard Storefront Controls for General Users */
            <>
              <button 
                className={`nav-btn ${currentView === 'storefront' ? 'active' : ''}`} 
                id="nav-shop-btn" 
                onClick={() => switchView('storefront')}
              >
                <ShoppingBag width="18" height="18" />
                <span className="nav-btn-text">Shop</span>
              </button>
              
              <div className="cart-icon-wrapper">
                <button 
                  className="nav-btn" 
                  id="nav-cart-btn" 
                  onClick={onOpenCart}
                >
                  <ShoppingCart width="18" height="18" />
                  <span className="nav-btn-text">Cart</span>
                </button>
                {totalQty > 0 && (
                  <motion.span 
                    key={totalQty}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                    className="cart-badge" 
                    id="cart-badge-count"
                  >
                    {totalQty}
                  </motion.span>
                )}
              </div>

              {/* User Account Controls */}
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <User width="14" height="14" style={{ color: 'var(--primary)' }} />
                    <span className="nav-user-text">Hello, {currentUser.firstName}</span>
                  </span>
                  <button 
                    className="nav-btn" 
                    onClick={logoutUser}
                    title="Log out"
                    style={{ padding: '0.6rem 0.8rem' }}
                  >
                    <LogOut width="16" height="16" />
                  </button>
                </div>
              ) : (
                <button 
                  className="nav-btn admin-toggle" 
                  id="nav-login-btn" 
                  onClick={onOpenAuth}
                >
                  <LogIn width="16" height="16" />
                  <span className="nav-btn-text">Sign In</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

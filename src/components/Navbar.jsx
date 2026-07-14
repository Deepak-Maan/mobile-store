import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, ShoppingBag, ShoppingCart, LogIn, LogOut,
  User, Shield, Heart, Sun, Moon, ChevronDown,
  Truck, LayoutGrid
} from 'lucide-react';
import { SmartSearch } from './SmartSearch';
import gsap from 'gsap';

export const Navbar = ({ onOpenCart, onOpenAuth, onOpenWishlist }) => {
  const {
    currentView, switchView, cart, currentUser, logoutUser,
    isAdminLoggedIn, wishlist, theme, toggleTheme
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const totalQty = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleThemeToggle = (e) => {
    // 1. Get exact position of click
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // 2. Compute screen coverage radius
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 3. Create absolute overlay div representing new theme state
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '999999';

    // Solid background color of the new incoming theme
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    overlay.style.background = nextTheme === 'light' ? '#f8fafc' : '#0a0a0e';

    document.body.appendChild(overlay);

    // 4. Animate overlay out radially using GSAP clipPath
    gsap.timeline({
      onComplete: () => {
        // Toggle context theme
        toggleTheme();
        
        // Smoothly fade out overlay after state finishes updating
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => overlay.remove()
        });
      }
    })
    .fromTo(overlay,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`, duration: 0.65, ease: 'power2.inOut' }
    );
  };

  // Lock body scroll when dropdown is open
  useEffect(() => {
    if (isUserMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isUserMenuOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (view) => { switchView(view); setIsUserMenuOpen(false); };

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : '';

  const menuItems = [
    { icon: User,        label: 'My Profile',  view: 'profile',  desc: 'Account & wishlist' },
    { icon: ShoppingBag, label: 'My Orders',   view: 'history',  desc: 'Order history'       },
    { icon: Truck,       label: 'Track Order', view: 'tracking', desc: 'Live tracking'        },
  ];

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar-container">

        {/* Brand */}
        <a href="#" className="nav-brand" id="nav-logo-link"
          onClick={(e) => { e.preventDefault(); switchView('storefront'); }}>
          <div className="brand-icon">
            <Smartphone style={{ color: '#fff', width: '20px', height: '20px' }} />
          </div>
          <span className="brand-name">AURA</span>
        </a>

        {!isAdminLoggedIn && (
          <div className="nav-search-wrapper">
            <SmartSearch />
          </div>
        )}

        <div className="nav-links">
          {isAdminLoggedIn ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
              color: '#a5b4fc', fontSize: '0.88rem', fontWeight: 600
            }}>
              <Shield width="15" height="15" /> Admin Control Mode
            </div>
          ) : (
            <>
              <motion.button 
                className="nav-btn theme-toggle" 
                onClick={handleThemeToggle}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme === 'dark' ? 'rgba(255, 243, 205, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? 'rgba(255, 243, 205, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  boxShadow: theme === 'dark' ? '0 0 10px rgba(245, 158, 11, 0.15)' : '0 0 10px rgba(99, 102, 241, 0.15)',
                  cursor: 'pointer'
                }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {theme === 'dark' ? (
                      <Sun width="16" height="16" fill="#f59e0b" color="#f59e0b" />
                    ) : (
                      <Moon width="16" height="16" fill="#6366f1" color="#6366f1" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Shop */}
              <button className={`nav-btn ${currentView === 'storefront' ? 'active' : ''}`}
                id="nav-shop-btn" onClick={() => switchView('storefront')}>
                <LayoutGrid width="17" height="17" />
                <span className="nav-btn-text">Shop</span>
              </button>

              {/* Wishlist */}
              <div className="cart-icon-wrapper" style={{ marginRight: '0.1rem' }}>
                <button className="nav-btn" onClick={onOpenWishlist}>
                  <Heart width="18" height="18"
                    fill={wishlist.length > 0 ? 'var(--accent-red)' : 'none'}
                    stroke={wishlist.length > 0 ? 'var(--accent-red)' : '#fff'} />
                  <span className="nav-btn-text">Favorites</span>
                </button>
                {wishlist.length > 0 && (
                  <motion.span key={wishlist.length}
                    initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="cart-badge" style={{ background: 'var(--accent-red)' }}>
                    {wishlist.length}
                  </motion.span>
                )}
              </div>

              {/* Cart */}
              <div className="cart-icon-wrapper">
                <button className="nav-btn" id="nav-cart-btn" onClick={onOpenCart}>
                  <ShoppingCart width="18" height="18" />
                  <span className="nav-btn-text">Cart</span>
                </button>
                {totalQty > 0 && (
                  <motion.span key={totalQty}
                    initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                    className="cart-badge" id="cart-badge-count">
                    {totalQty}
                  </motion.span>
                )}
              </div>

              {/* User Dropdown OR Sign In */}
              {currentUser ? (
                <div ref={menuRef} style={{ position: 'relative' }}>

                  {/* Trigger pill */}
                  <button
                    id="nav-user-menu-btn"
                    onClick={() => setIsUserMenuOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.55rem',
                      background: isUserMenuOpen
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'rgba(99,102,241,0.1)',
                      border: '1px solid',
                      borderColor: isUserMenuOpen ? 'transparent' : 'rgba(99,102,241,0.3)',
                      borderRadius: '30px',
                      padding: '0.4rem 0.9rem 0.4rem 0.42rem',
                      cursor: 'pointer',
                      transition: 'all 0.22s ease',
                      boxShadow: isUserMenuOpen ? '0 4px 18px rgba(99,102,241,0.45)' : 'none',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: isUserMenuOpen
                        ? 'rgba(255,255,255,0.25)'
                        : 'linear-gradient(135deg, #6366f1, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.66rem', fontWeight: 900,
                      color: '#fff', flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.25)',
                      letterSpacing: '0.02em'
                    }}>
                      {initials || <User size={13} />}
                    </div>
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 700,
                      color: isUserMenuOpen ? '#fff' : 'var(--text-primary)',
                      whiteSpace: 'nowrap'
                    }}>
                      Hello, {currentUser.firstName}
                    </span>
                    <motion.div animate={{ rotate: isUserMenuOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                      <ChevronDown size={14} color={isUserMenuOpen ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'} />
                    </motion.div>
                  </button>

                  {/* Dropdown panel */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 12px)',
                          right: 0,
                          width: '240px',
                          background: '#1a1a24',
                          border: '1px solid rgba(99,102,241,0.25)',
                          borderRadius: '16px',
                          zIndex: 9999,
                          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Header */}
                        <div style={{
                          padding: '1rem 1.1rem 0.85rem',
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 900, color: '#fff',
                            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                          }}>
                            {initials || <User size={16} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                              {currentUser.firstName} {currentUser.lastName}
                            </div>
                            <div style={{
                              fontSize: '0.71rem', color: 'rgba(255,255,255,0.45)',
                              marginTop: '0.2rem', overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {currentUser.email}
                            </div>
                          </div>
                        </div>

                        {/* Nav items */}
                        <div style={{ padding: '0.5rem' }}>
                          {menuItems.map((item, i) => {
                            const isActive = currentView === item.view;
                            return (
                              <motion.button
                                key={item.view}
                                onClick={() => navigate(item.view)}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.045 }}
                                whileHover={{ backgroundColor: 'rgba(99,102,241,0.1)' }}
                                style={{
                                  width: '100%', display: 'flex', alignItems: 'center',
                                  gap: '0.75rem', padding: '0.65rem 0.8rem',
                                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                  border: 'none', borderRadius: '10px',
                                  cursor: 'pointer', textAlign: 'left',
                                  marginBottom: '0.1rem', transition: 'background 0.15s'
                                }}
                              >
                                <div style={{
                                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                  background: isActive ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: isActive ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)'
                                }}>
                                  <item.icon size={15} color={isActive ? '#818cf8' : 'rgba(255,255,255,0.5)'} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontSize: '0.84rem', fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#c7d2fe' : 'rgba(255,255,255,0.8)',
                                    lineHeight: 1
                                  }}>
                                    {item.label}
                                  </div>
                                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
                                    {item.desc}
                                  </div>
                                </div>
                                {isActive && (
                                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Divider + Sign out */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem' }}>
                          <button
                            onClick={() => { logoutUser(); setIsUserMenuOpen(false); }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center',
                              gap: '0.75rem', padding: '0.65rem 0.8rem',
                              background: 'transparent', border: 'none', borderRadius: '10px',
                              cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                            }}
                          >
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <LogOut size={14} color="#f87171" />
                            </div>
                            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f87171' }}>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button className="nav-btn admin-toggle" id="nav-login-btn" onClick={onOpenAuth}>
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

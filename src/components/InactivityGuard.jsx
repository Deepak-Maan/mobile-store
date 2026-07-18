import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InactivityGuard = () => {
  const { currentUser, isAdminLoggedIn, logoutUser, logoutAdmin } = useStore();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const isLoggedIn = !!currentUser || !!isAdminLoggedIn;
  
  // 5 Minutes Idle Limit (300,000 milliseconds)
  const IDLE_LIMIT = 5 * 60 * 1000; 

  const resetIdleTimer = useCallback(() => {
    if (showWarning) return; // Don't reset if warning is already showing

    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (isLoggedIn) {
      timerRef.current = setTimeout(() => {
        setShowWarning(true);
        setCountdown(30);
      }, IDLE_LIMIT);
    }
  }, [isLoggedIn, showWarning, IDLE_LIMIT]);

  const handleSessionTimeout = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowWarning(false);
    
    // Log out both user and admin sessions
    if (currentUser) logoutUser();
    if (isAdminLoggedIn) logoutAdmin();
  }, [currentUser, isAdminLoggedIn, logoutUser, logoutAdmin]);

  // Listen to user activity to reset idle timer
  useEffect(() => {
    if (!isLoggedIn) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setShowWarning(false);
      return;
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'click'];
    
    const handleActivity = () => resetIdleTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetIdleTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn, resetIdleTimer]);

  // Countdown handler when warning is active
  useEffect(() => {
    if (showWarning) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleSessionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarning, handleSessionTimeout]);

  const handleResume = () => {
    setShowWarning(false);
    resetIdleTimer();
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="checkout-card"
            style={{
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'linear-gradient(135deg, rgba(28, 28, 38, 0.95), rgba(16, 16, 22, 0.98))',
              boxShadow: '0 50px 100px rgba(0,0,0,0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
              padding: '2.2rem 2rem',
            }}
          >
            <div style={{
              background: 'rgba(239, 114, 21, 0.1)',
              border: '2px solid rgba(239, 114, 21, 0.25)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316',
              margin: '0 auto 1.5rem auto',
              animation: 'inactivity-pulse 2s infinite',
            }}>
              <Clock width="30" height="30" />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              Session Timeout Inbound
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0.8rem 0 1.8rem 0' }}>
              We noticed you have been inactive. For your security, you will be logged out automatically in:
            </p>

            {/* Glowing countdown display */}
            <div style={{
              fontSize: '4.2rem',
              fontWeight: 900,
              color: countdown <= 10 ? '#ef4444' : '#6366f1',
              fontFamily: 'var(--font-display)',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              marginBottom: '2rem',
              textShadow: countdown <= 10 ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 0 25px rgba(99, 102, 241, 0.35)',
              transition: 'color 0.35s ease'
            }}>
              {countdown}s
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={handleSessionTimeout}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'transparent',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Log Out
              </button>
              
              <button
                type="button"
                onClick={handleResume}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                }}
              >
                Keep Me Signed In
              </button>
            </div>

          </motion.div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes inactivity-pulse {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 114, 21, 0.4); }
              70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 114, 21, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 114, 21, 0); }
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

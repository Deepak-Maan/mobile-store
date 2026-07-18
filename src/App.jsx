import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveBackground } from './components/InteractiveBackground';
import { CustomCursor } from './components/CustomCursor';
import { FeaturesSection } from './components/FeaturesSection';
import { StatsSection } from './components/StatsSection';

// Storefront Expansion Components
import { WishlistDrawer } from './components/WishlistDrawer';
import { ComparisonConsole } from './components/ComparisonConsole';
import { SalesTicker } from './components/SalesTicker';
import { BackToTop } from './components/BackToTop';
import { CartFlyProvider } from './components/CartFlyAnimation';
import { RecentlyViewedBar } from './components/RecentlyViewedBar';
import { FlashSaleBanner } from './components/FlashSaleBanner';
import { VisitorTracker } from './components/VisitorTracker';

// Lazy Loaded Components for Lightweight Bundling & Faster Loading
const Checkout = lazy(() => import('./components/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./components/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const Faq = lazy(() => import('./components/Faq').then(m => ({ default: m.Faq })));
const OrderTracker = lazy(() => import('./components/OrderTracker').then(m => ({ default: m.OrderTracker })));
const OrderHistory = lazy(() => import('./components/OrderHistory').then(m => ({ default: m.OrderHistory })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const AccessoryBuilder = lazy(() => import('./components/AccessoryBuilder').then(m => ({ default: m.AccessoryBuilder })));

// 3D Parallax & Depth Sections
import { UniverseHeroReveal } from './components/UniverseHeroReveal';
import { SEO } from './components/SEO';
import { InactivityGuard } from './components/InactivityGuard';
import { SpotlightCarousel } from './components/SpotlightCarousel';
import { DeviceExploder } from './components/DeviceExploder';
import { CameraLensZoom } from './components/CameraLensZoom';
import { ParallaxShowcase } from './components/ParallaxShowcase';

function App() {
  const { currentView, isAdminLoggedIn, compareIds, isAuthOpen, setIsAuthOpen } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    if (isCartOpen || isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isWishlistOpen]);

  const handleExploreClick = () => {
    const catalogControls = document.getElementById('catalog-controls');
    if (catalogControls) {
      catalogControls.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <CartFlyProvider>
      <SEO />
      <InactivityGuard />
      <div className="app-shell" style={{ position: 'relative', minHeight: '100vh' }}>
        {/* Flash Sale Countdown Banner */}
        <FlashSaleBanner />

        {/* Silent Visitor Tracker — background only, renders nothing */}
        <VisitorTracker />

        {/* Global Interactive Elements */}
        <InteractiveBackground />
        <CustomCursor />

        {/* Dynamic Toast Alerts Stack */}
        <ToastContainer />

        {/* Global Navigation Bar */}
        <Navbar 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
        />

        {/* Main View Router */}
        <main style={{ position: 'relative', overflow: 'hidden' }}>
          <Suspense fallback={
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              minHeight: '60vh', gap: '1rem', color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Aura Computing...</span>
            </div>
          }>
            <AnimatePresence mode="wait">
              {currentView === 'storefront' && (
                <motion.div
                  key="storefront"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Hero onExplore={handleExploreClick} />
                  <UniverseHeroReveal />
                  <FeaturesSection />
                  <RecentlyViewedBar />
                  <Catalog />
                  <ParallaxShowcase />
                  <SpotlightCarousel />
                  <DeviceExploder />
                  <AccessoryBuilder />
                  <StatsSection />
                  <CameraLensZoom />
                  <Faq />
                </motion.div>
              )}

              {currentView === 'tracking' && (
                <motion.div
                  key="tracking"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <OrderTracker />
                </motion.div>
              )}

              {currentView === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <OrderHistory />
                </motion.div>
              )}

              {currentView === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <UserProfile />
                </motion.div>
              )}

              {currentView === 'checkout' && (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Checkout onOpenAuth={() => setIsAuthOpen(true)} />
                </motion.div>
              )}

              {currentView === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <OrderSuccess />
                </motion.div>
              )}

              {currentView === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {isAdminLoggedIn ? <AdminLayout /> : <AdminLogin />}
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </main>

      {/* Global Modals & Sliding Drawers */}
      <ProductModal />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <ComparisonConsole isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />

      {/* Floating Interactive Live Activity Feeds */}
      {currentView !== 'admin' && <SalesTicker />}

      {/* Floating Compare Widget Pill */}
      {compareIds.length > 0 && currentView === 'storefront' && (
        <button
          onClick={() => setIsCompareOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 290,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            padding: '0.75rem 1.4rem',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Compare ({compareIds.length})
        </button>
      )}

      {/* Back to Top Button */}
      <BackToTop compareActive={compareIds.length > 0 && currentView === 'storefront'} />

        {/* Global Footer */}
        {currentView !== 'admin' && currentView !== 'checkout' && (
          <Footer 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        )}
      </div>
    </CartFlyProvider>
  );
}

export default App;

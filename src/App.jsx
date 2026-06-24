import React, { useState, useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Checkout } from './components/Checkout';
import { OrderSuccess } from './components/OrderSuccess';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { Faq } from './components/Faq';

function App() {
  const { currentView, isAdminLoggedIn } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handleExploreClick = () => {
    const catalogControls = document.getElementById('catalog-controls');
    if (catalogControls) {
      catalogControls.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-shell" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Dynamic Toast Alerts Stack */}
      <ToastContainer />

      {/* Global Navigation Bar */}
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main>
        {currentView === 'storefront' && (
          <>
            <Hero onExplore={handleExploreClick} />
            <Catalog />
            <Faq />
          </>
        )}

        {currentView === 'checkout' && (
          <Checkout onOpenAuth={() => setIsAuthOpen(true)} />
        )}

        {currentView === 'success' && <OrderSuccess />}

        {currentView === 'admin' && (
          isAdminLoggedIn ? <AdminLayout /> : <AdminLogin />
        )}
      </main>

      {/* Global Modals & Sliding Drawers */}
      <ProductModal />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Global Footer */}
      {currentView !== 'admin' && currentView !== 'checkout' && (
        <Footer 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenAuth={() => setIsAuthOpen(true)} 
        />
      )}
    </div>
  );
}

export default App;

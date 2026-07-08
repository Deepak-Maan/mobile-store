import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Heart, ShoppingCart } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { formatINR } from '../utils/currency';

export const WishlistDrawer = ({ isOpen, onClose }) => {
  const { wishlist, products, toggleWishlist, addToCart } = useStore();

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddToCart = (productId) => {
    addToCart(productId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cart-drawer-overlay"
            onClick={onClose}
            style={{ display: 'block', zIndex: 190 }}
          />

          {/* Sliding Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 27 }}
            className="cart-drawer"
            style={{ display: 'flex', zIndex: 200 }}
          >
            <div className="cart-header">
              <h3>
                <Heart width="20" height="20" fill="var(--accent-red)" stroke="var(--accent-red)" style={{ display: 'inline-block', marginRight: '0.4rem' }} />
                My Favorites
              </h3>
              <button className="cart-close" onClick={onClose}>
                <X width="18" height="18" strokeWidth={2.5} />
              </button>
            </div>

            <div className="cart-items-list">
              {favoriteProducts.length === 0 ? (
                <div className="cart-empty-state">
                  <Heart width="48" height="48" style={{ opacity: 0.4, marginBottom: '1rem', color: 'var(--text-muted)' }} />
                  <p>Your wishlist is empty</p>
                  <button className="filter-btn" style={{ marginTop: '0.5rem' }} onClick={onClose}>
                    Explore Storefront
                  </button>
                </div>
              ) : (
                favoriteProducts.map((phone) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="cart-item"
                    key={phone.id}
                  >
                    <div className="cart-item-visual">
                      <ProductImage src={phone.images[0]} alt={phone.name} />
                    </div>
                    <div className="cart-item-info" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <h4 className="cart-item-name">{phone.name}</h4>
                      <span className="cart-item-brand">{phone.brand}</span>
                      <div className="cart-item-price" style={{ margin: '0.2rem 0 0.5rem 0' }}>{formatINR(phone.price)}</div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button
                          onClick={() => handleAddToCart(phone.id)}
                          disabled={phone.stock === 0}
                          className="nav-btn admin-toggle"
                          style={{
                            flex: 1,
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.78rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            background: phone.stock === 0 ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            border: 'none',
                            color: '#fff',
                            cursor: phone.stock === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ShoppingCart width="13" height="13" />
                          {phone.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => toggleWishlist(phone.id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-red)',
                            cursor: 'pointer'
                          }}
                          title="Remove Favorite"
                        >
                          <Trash2 width="14" height="14" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

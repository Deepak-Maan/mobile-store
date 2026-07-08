import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { formatINR } from '../utils/currency';

const adjustSvgColors = (svgString, colorName) => {
  if (!svgString || !colorName || !svgString.trim().startsWith('<svg')) return svgString;
  
  const colorGradients = {
    'Obsidian Black': {
      front: '<stop offset="0%" stop-color="#2d2d30" /><stop offset="100%" stop-color="#0a0a0c" />',
      back: '<stop offset="0%" stop-color="#212124" /><stop offset="100%" stop-color="#0a0a0c" />',
      macro: '<stop offset="0%" stop-color="#2d2d30" /><stop offset="100%" stop-color="#0a0a0c" />'
    },
    'Titanium Silver': {
      front: '<stop offset="0%" stop-color="#f1f5f9" /><stop offset="100%" stop-color="#cbd5e1" />',
      back: '<stop offset="0%" stop-color="#e2e8f0" /><stop offset="100%" stop-color="#94a3b8" />',
      macro: '<stop offset="0%" stop-color="#cbd5e1" /><stop offset="100%" stop-color="#64748b" />'
    },
    'Emerald Green': {
      front: '<stop offset="0%" stop-color="#14532d" /><stop offset="100%" stop-color="#022c22" />',
      back: '<stop offset="0%" stop-color="#166534" /><stop offset="100%" stop-color="#022c22" />',
      macro: '<stop offset="0%" stop-color="#15803d" /><stop offset="100%" stop-color="#022c22" />'
    },
    'Desert Gold': {
      front: '<stop offset="0%" stop-color="#78350f" /><stop offset="100%" stop-color="#451a03" />',
      back: '<stop offset="0%" stop-color="#d97706" /><stop offset="100%" stop-color="#451a03" />',
      macro: '<stop offset="0%" stop-color="#d97706" /><stop offset="78%" stop-color="#78350f" />'
    }
  };

  const selectedGrad = colorGradients[colorName];
  if (!selectedGrad) return svgString;

  let modifiedSvg = svgString;
  modifiedSvg = modifiedSvg.replace(/(<linearGradient id="front-[^"]+"[^>]*>)([\s\S]*?)(<\/linearGradient>)/i, `$1${selectedGrad.front}$3`);
  modifiedSvg = modifiedSvg.replace(/(<linearGradient id="back-[^"]+"[^>]*>)([\s\S]*?)(<\/linearGradient>)/i, `$1${selectedGrad.back}$3`);
  modifiedSvg = modifiedSvg.replace(/(<linearGradient id="macro-[^"]+"[^>]*>)([\s\S]*?)(<\/linearGradient>)/i, `$1${selectedGrad.macro}$3`);

  return modifiedSvg;
};

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, products, updateCartQuantity, removeFromCart, switchView } = useStore();

  const getItemPrice = (item, phone) => {
    if (!phone) return 0;
    let price = phone.price;
    if (phone.brand !== 'Aura Accessories') {
      if (item.storage === '256GB') price += 8000;
      else if (item.storage === '512GB') price += 16000;
      else if (item.storage === '1TB') price += 24000;
    }
    return price;
  };

  const subtotal = cart.reduce((acc, item) => {
    const phone = products.find((p) => p.id === item.productId);
    return acc + (phone ? getItemPrice(item, phone) * item.quantity : 0);
  }, 0);

  const handleCheckout = () => {
    onClose();
    switchView('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cart-drawer-overlay"
            id="cart-drawer-overlay"
            onClick={onClose}
            style={{ display: 'block' }}
          />

          {/* Sliding Drawer Card */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 27 }}
            className="cart-drawer"
            id="cart-drawer-container"
            style={{ display: 'flex' }}
          >
            <div className="cart-header">
              <h3>
                <ShoppingCart width="20" height="20" />
                Your Shopping Cart
              </h3>
              <button 
                className="cart-close" 
                id="close-cart-btn" 
                onClick={onClose}
              >
                <X width="18" height="18" strokeWidth={2.5} />
              </button>
            </div>

            <div className="cart-items-list" id="cart-items-wrapper">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingCart width="48" height="48" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Your cart is empty</p>
                  <button 
                    className="filter-btn" 
                    style={{ marginTop: '0.5rem' }} 
                    onClick={onClose}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const phone = products.find((p) => p.id === item.productId);
                  if (!phone) return null;
                  
                  const itemPrice = getItemPrice(item, phone);

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="cart-item" 
                      key={`${item.productId}-${item.storage || '128GB'}-${item.color || 'Obsidian Black'}`}
                    >
                      {(() => {
                        const customColorImg = (phone.colorImages && phone.colorImages[item.color] && phone.colorImages[item.color][0]) 
                          ? phone.colorImages[item.color][0] 
                          : phone.images[0];
                        return (
                          <div className="cart-item-visual">
                            <ProductImage 
                              src={phone.brand === 'Aura Accessories' ? phone.images[0] : adjustSvgColors(customColorImg, item.color)} 
                              alt={phone.name} 
                              color={phone.brand === 'Aura Accessories' ? undefined : item.color}
                            />
                          </div>
                        );
                      })()}
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{phone.name}</h4>
                        <span className="cart-item-brand">{phone.brand}</span>
                        {phone.brand !== 'Aura Accessories' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, margin: '0.1rem 0 0.35rem 0' }}>
                            {item.storage || '128GB'} • {item.color || 'Obsidian Black'}
                          </div>
                        )}
                        <div className="cart-item-price">{formatINR(itemPrice)}</div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-controller">
                            <button 
                              className="quantity-btn" 
                              onClick={() => updateCartQuantity(phone.id, item.storage, item.color, -1)}
                            >
                              -
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button 
                              className="quantity-btn" 
                              onClick={() => updateCartQuantity(phone.id, item.storage, item.color, 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            className="remove-cart-item" 
                            title="Delete item" 
                            onClick={() => removeFromCart(phone.id, item.storage, item.color)}
                          >
                            <Trash2 width="18" height="18" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer" id="cart-footer-summary">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span id="cart-subtotal-price">{formatINR(subtotal)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Estimated Shipping</span>
                  <span id="cart-shipping-price">FREE</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Estimated Total</span>
                  <span id="cart-total-price">{formatINR(subtotal)}</span>
                </div>
                <button 
                  className="checkout-btn" 
                  id="cart-checkout-btn" 
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight width="18" height="18" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

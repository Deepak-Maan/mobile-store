import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { formatINR } from '../utils/currency';

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, products, updateCartQuantity, removeFromCart, switchView } = useStore();

  const subtotal = cart.reduce((acc, item) => {
    const phone = products.find((p) => p.id === item.productId);
    return acc + (phone ? phone.price * item.quantity : 0);
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

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="cart-item" 
                      key={item.productId}
                    >
                      <div className="cart-item-visual">
                        <ProductImage src={phone.images[0]} alt={phone.name} />
                      </div>
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{phone.name}</h4>
                        <span className="cart-item-brand">{phone.brand}</span>
                        <div className="cart-item-price">{formatINR(phone.price)}</div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-controller">
                            <button 
                              className="quantity-btn" 
                              onClick={() => updateCartQuantity(phone.id, -1)}
                            >
                              -
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button 
                              className="quantity-btn" 
                              onClick={() => updateCartQuantity(phone.id, 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            className="remove-cart-item" 
                            title="Delete item" 
                            onClick={() => removeFromCart(phone.id)}
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

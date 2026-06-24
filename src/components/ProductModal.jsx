import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from './ProductImage';
import gsap from 'gsap';

export const ProductModal = () => {
  const { selectedProductId, setSelectedProductId, products, addToCart } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imageViewportRef = useRef(null);

  const phone = products.find((p) => p.id === selectedProductId);

  // Reset image index when product changes or modal opens
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProductId]);

  // GSAP animation when the active image index changes
  useEffect(() => {
    if (!selectedProductId || !phone) return;
    
    const activeImg = imageViewportRef.current?.querySelector('svg, img');
    if (activeImg) {
      // Create a premium lens pop and scale bounce effect on the active visual element
      gsap.fromTo(activeImg,
        { opacity: 0, scale: 0.85, y: 15, rotate: 1 },
        { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.55, ease: 'back.out(1.5)' }
      );
    }
  }, [currentImageIndex, selectedProductId]);

  const handleClose = (e) => {
    if (e.target.id === 'product-modal-overlay' || e.currentTarget.id === 'close-modal-btn') {
      setSelectedProductId(null);
    }
  };

  const handleAddAndClose = () => {
    if (phone) {
      addToCart(phone.id);
      setSelectedProductId(null);
    }
  };

  // Gallery Navigation Handlers
  const handlePrev = () => {
    if (!phone) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? phone.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!phone) return;
    setCurrentImageIndex((prev) => 
      prev === phone.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <AnimatePresence>
      {phone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="modal-overlay"
          id="product-modal-overlay"
          onClick={handleClose}
          style={{ display: 'flex' }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="modal-container"
            id="product-detail-modal"
            style={{ maxWidth: '850px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close" 
              id="close-modal-btn" 
              onClick={handleClose}
            >
              <X width="18" height="18" strokeWidth={2.5} />
            </button>
            
            <div className="modal-body" style={{ gridTemplateColumns: '1.1fr 1.2fr' }}>
              
              {/* Left Column: GSAP Interactive Image Gallery */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div 
                  className="modal-visual" 
                  style={{ position: 'relative', overflow: 'hidden', height: '310px', padding: '1rem' }}
                >
                  {/* Floating Left Arrow */}
                  <motion.button 
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, outline: 'none' }}
                  >
                    <ChevronLeft width="20" height="20" strokeWidth={2.5} />
                  </motion.button>

                  {/* Central Active Image Viewport */}
                  <div 
                    ref={imageViewportRef} 
                    style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
                  >
                    <ProductImage src={phone.images[currentImageIndex]} alt={phone.name} />
                  </div>

                  {/* Floating Right Arrow */}
                  <motion.button 
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, outline: 'none' }}
                  >
                    <ChevronRight width="20" height="20" strokeWidth={2.5} />
                  </motion.button>
                </div>

                {/* Interactive Thumbnails Navigation Row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                  {phone.images.map((imgSrc, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      style={{ 
                        width: '52px', 
                        height: '68px', 
                        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                        border: currentImageIndex === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '0.2rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: currentImageIndex === idx ? '0 0 10px var(--primary-glow)' : 'none',
                        outline: 'none',
                        transition: 'border 0.2s ease, box-shadow 0.2s ease'
                      }}
                    >
                      <div 
                        style={{ width: '100%', height: '100%', opacity: currentImageIndex === idx ? 1 : 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'opacity 0.2s ease' }} 
                      >
                        <ProductImage src={imgSrc} alt={`${phone.name} view ${idx + 1}`} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Right Column: Specifications Details */}
              <div className="modal-details">
                <span className="modal-brand">{phone.brand}</span>
                <h2 className="modal-name">{phone.name}</h2>
                <span className="modal-price">${phone.price.toLocaleString()}</span>
                <p className="modal-desc">{phone.description}</p>
                
                <h4 className="specs-title">Technical Specifications</h4>
                <div className="specs-grid">
                  {Object.entries(phone.specs).map(([label, value]) => (
                    <div className="spec-item" key={label}>
                      <span className="spec-label">{label}</span>
                      <span className="spec-value" title={value}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-action-row">
                  <div className={`stock-indicator ${phone.stock === 0 ? 'out' : (phone.stock < 5 ? 'low' : 'in')}`}>
                    <span className="stock-dot"></span>
                    <span style={{ fontSize: '0.9rem' }}>
                      {phone.stock === 0 ? 'Sold Out' : (phone.stock < 5 ? `Low Stock: ${phone.stock} left` : 'In Stock')}
                    </span>
                  </div>
                  <button 
                    className="modal-buy-btn" 
                    onClick={handleAddAndClose} 
                    disabled={phone.stock === 0}
                  >
                    <ShoppingCart width="18" height="18" strokeWidth={2.5} />
                    Add To Shopping Cart
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

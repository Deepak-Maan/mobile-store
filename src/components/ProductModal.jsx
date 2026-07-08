import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Phone360Viewer } from './360Viewer';
import { RecommendedSection } from './RecommendedSection';
import gsap from 'gsap';
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
      macro: '<stop offset="0%" stop-color="#d97706" /><stop offset="100%" stop-color="#78350f" />'
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

export const ProductModal = () => {
  const { selectedProductId, setSelectedProductId, products, addToCart } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState('128GB');
  const [selectedColor, setSelectedColor] = useState('Obsidian Black');
  
  const imageViewportRef = useRef(null);

  const phone = products.find((p) => p.id === selectedProductId);

  const colors = phone && phone.colors && phone.colors.length > 0
    ? phone.colors
    : ['Obsidian Black', 'Titanium Silver', 'Emerald Green', 'Desert Gold'];
  
  const storages = ['128GB', '256GB', '512GB', '1TB'];

  // Reset states when product changes or modal opens
  useEffect(() => {
    setCurrentImageIndex(0);
    setIs360Mode(false);
    setSelectedStorage('128GB');
    const defaultColors = phone && phone.colors && phone.colors.length > 0
      ? phone.colors
      : ['Obsidian Black', 'Titanium Silver', 'Emerald Green', 'Desert Gold'];
    setSelectedColor(defaultColors[0] || 'Obsidian Black');
  }, [selectedProductId, phone]);

  // Reset 360 mode when image index changes (e.g. clicking a thumbnail)
  useEffect(() => {
    setIs360Mode(false);
  }, [currentImageIndex]);

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
      addToCart(phone.id, { storage: selectedStorage, color: selectedColor });
      setSelectedProductId(null);
    }
  };

  // Dynamically compute active gallery based on selected variant color (supporting custom uploaded variant galleries)
  const getActiveGallery = () => {
    if (!phone) return [];
    if (phone.colorImages && phone.colorImages[selectedColor] && phone.colorImages[selectedColor].some(img => img && img.trim() !== '')) {
      return phone.colorImages[selectedColor];
    }
    return phone.images || [];
  };
  const activeGallery = getActiveGallery();

  // Gallery Navigation Handlers
  const handlePrev = () => {
    if (activeGallery.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? activeGallery.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (activeGallery.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === activeGallery.length - 1 ? 0 : prev + 1
    );
  };

  // Helper to dynamically adjust pricing
  const getStoragePremium = (storage) => {
    if (storage === '256GB') return 8000;
    if (storage === '512GB') return 16000;
    if (storage === '1TB') return 24000;
    return 0;
  };

  const extraCost = (!phone || phone.brand === 'Aura Accessories') ? 0 : getStoragePremium(selectedStorage);
  const finalPrice = phone ? (phone.price + extraCost) : 0;

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
            style={{ maxWidth: '1062px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close" 
              id="close-modal-btn" 
              onClick={handleClose}
            >
              <X width="18" height="18" strokeWidth={2.5} />
            </button>
            
            <div className="modal-body">
              
              {/* Left Column: GSAP Interactive Image Gallery */}
              <div className="modal-gallery" style={{ position: 'relative' }}>
                {phone.brand !== 'Aura Accessories' && (
                  <button
                    onClick={() => setIs360Mode(!is360Mode)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: is360Mode ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '20px',
                      padding: '0.4rem 0.95rem',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: is360Mode ? '0 4px 12px var(--primary-glow)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {is360Mode ? 'Switch to Gallery' : 'Interactive 360° Rotate'}
                  </button>
                )}

                <div className="modal-visual">
                  {/* Floating Left Arrow */}
                  {!is360Mode && (
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrev}
                      className="modal-nav-btn prev"
                    >
                      <ChevronLeft width="20" height="20" strokeWidth={2.5} />
                    </motion.button>
                  )}

                  {/* Central Active Image Viewport */}
                  <div 
                    ref={imageViewportRef} 
                    className="modal-active-viewport"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {is360Mode ? (
                      <Phone360Viewer images={activeGallery.map(img => adjustSvgColors(img, selectedColor))} name={phone.name} />
                    ) : (
                      <ProductImage 
                        src={phone.brand === 'Aura Accessories' ? activeGallery[currentImageIndex] : adjustSvgColors(activeGallery[currentImageIndex], selectedColor)} 
                        alt={phone.name} 
                        color={phone.brand === 'Aura Accessories' ? undefined : selectedColor}
                      />
                    )}
                  </div>

                  {/* Floating Right Arrow */}
                  {!is360Mode && (
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="modal-nav-btn next"
                    >
                      <ChevronRight width="20" height="20" strokeWidth={2.5} />
                    </motion.button>
                  )}
                </div>

                {/* Interactive Thumbnails Navigation Row */}
                <div className="modal-thumbnails">
                  {activeGallery.map((imgSrc, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className={`modal-thumbnail-btn ${currentImageIndex === idx ? 'active' : ''}`}
                    >
                      <div className="modal-thumbnail-inner">
                        <ProductImage 
                          src={phone.brand === 'Aura Accessories' ? imgSrc : adjustSvgColors(imgSrc, selectedColor)} 
                          alt={`${phone.name} view ${idx + 1}`} 
                          color={phone.brand === 'Aura Accessories' ? undefined : selectedColor}
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Right Column: Specifications Details */}
              <div className="modal-details">
                <span className="modal-brand">{phone.brand}</span>
                <h2 className="modal-name">{phone.name}</h2>
                <span className="modal-price">{formatINR(finalPrice)}</span>
                <p className="modal-desc">{phone.description}</p>
                
                {/* Configuration Panel */}
                {phone.brand !== 'Aura Accessories' && (
                  <div style={{ margin: '0.2rem 0 1.6rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                    {/* Color Swatches */}
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Color: <strong style={{ color: '#fff' }}>{selectedColor}</strong></span>
                      <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.45rem' }}>
                        {colors.map((c) => {
                          const swatchColor = c === 'Obsidian Black' ? '#1c1917' : c === 'Titanium Silver' ? '#cbd5e1' : c === 'Emerald Green' ? '#166534' : '#b45309';
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setSelectedColor(c)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: swatchColor,
                                border: selectedColor === c ? '3px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                transform: selectedColor === c ? 'scale(1.18)' : 'none',
                                boxShadow: selectedColor === c ? '0 0 12px var(--primary)' : 'none'
                              }}
                              title={c}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Storage Options */}
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Storage</span>
                      <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                        {storages.map((s) => {
                          const premiumText = s === '128GB' ? ' (Base)' : s === '256GB' ? ' (+₹8k)' : s === '512GB' ? ' (+₹16k)' : ' (+₹24k)';
                          const isSelected = selectedStorage === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedStorage(s)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                background: isSelected ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                color: isSelected ? '#a5b4fc' : 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {s}{premiumText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

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

                {/* AI-Style Recommendation Engine */}
                <RecommendedSection currentPhone={phone} />

              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

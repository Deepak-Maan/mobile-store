import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Link2, Trash } from 'lucide-react';
import { ProductImage } from '../ProductImage';

export const ProductFormModal = ({ isOpen, productId, onClose }) => {
  const { products, saveProduct } = useStore();

  const [form, setForm] = useState({
    id: '',
    name: '',
    brand: 'Apple',
    price: '',
    stock: '',
    description: '',
    images: ['', '', '', '', ''],
    specs: {
      display: '',
      processor: '',
      ram: '',
      storage: '',
      camera: '',
      battery: ''
    }
  });

  const [activeImageTab, setActiveImageTab] = useState(0);

  // Populate form if in edit mode
  useEffect(() => {
    if (productId) {
      const phone = products.find((p) => p.id === productId);
      if (phone) {
        setForm({
          id: phone.id,
          name: phone.name,
          brand: phone.brand,
          price: phone.price,
          stock: phone.stock,
          description: phone.description,
          images: phone.images ? [...phone.images] : ['', '', '', '', ''],
          specs: { ...phone.specs }
        });
      }
    } else {
      // Reset form if in add mode
      setForm({
        id: '',
        name: '',
        brand: 'Apple',
        price: '',
        stock: '',
        description: '',
        images: ['', '', '', '', ''],
        specs: {
          display: '',
          processor: '',
          ram: '',
          storage: '',
          camera: '',
          battery: ''
        }
      });
    }
    setActiveImageTab(0);
  }, [productId, isOpen, products]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('form-product-', '');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSpecChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('form-spec-', '');
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
  };

  const handleImageUrlChange = (index, value) => {
    setForm((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index] = value;
      return { ...prev, images: updatedImages };
    });
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setForm((prev) => {
        const updatedImages = [...prev.images];
        updatedImages[index] = base64String;
        return { ...prev, images: updatedImages };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (index) => {
    setForm((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index] = '';
      return { ...prev, images: updatedImages };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productToSave = {
      ...form,
      price: parseInt(form.price) || 0
    };
    saveProduct(productToSave);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'inventory-form-overlay') {
      onClose();
    }
  };

  const imageTabNames = [
    'Front / Primary',
    'Back View',
    'Side Profile',
    'Camera Macro',
    'Lifestyle Shot'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="form-modal-overlay"
          id="inventory-form-overlay"
          onClick={handleOverlayClick}
          style={{ display: 'flex' }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="form-modal-container"
            id="inventory-form-modal"
            style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="form-modal-header">
              <h3 id="inventory-modal-heading">
                {productId ? `Edit: ${form.name}` : 'Add New Smartphone'}
              </h3>
              <button 
                className="form-modal-close" 
                id="close-form-btn" 
                onClick={onClose}
              >
                <X width="16" height="16" strokeWidth={2.5} />
              </button>
            </div>
            
            <form className="checkout-form" id="inventory-item-form" onSubmit={handleSubmit}>
              
              {/* Product Photos & Gallery Manager */}
              <div className="form-group" style={{ marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem', display: 'block' }}>
                  Smartphone Photo Gallery (Up to 5 Photos)
                </label>
                
                {/* Horizontal Thumbnails Row */}
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {form.images.map((imgSrc, idx) => {
                    const hasImg = imgSrc && imgSrc.trim() !== '';
                    const isActive = activeImageTab === idx;
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveImageTab(idx)}
                        style={{
                          width: '74px',
                          height: '96px',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 0 8px var(--primary-glow)' : 'none',
                          position: 'relative',
                          flexShrink: 0,
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {hasImg ? (
                          <ProductImage src={imgSrc} alt="Preview" style={{ width: '100%', height: '80%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ fontSize: '1.5rem', opacity: 0.35, display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>+</div>
                        )}
                        <span style={{ fontSize: '0.62rem', color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'center', marginTop: '0.2rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                          {imageTabNames[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Active Photo Controller */}
                <div 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                      Configure: {imageTabNames[activeImageTab]}
                    </span>
                    {!form.images[activeImageTab] ? (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Falls back to procedural SVG
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClearImage(activeImageTab)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Trash width="12" height="12" />
                        Clear Photo
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>
                    <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                      <Link2 width="14" height="14" style={{ position: 'absolute', left: '0.8rem', opacity: 0.5 }} />
                      <input
                        type="text"
                        placeholder="Paste photo URL or path (e.g. /images/...)"
                        value={form.images[activeImageTab]}
                        onChange={(e) => handleImageUrlChange(activeImageTab, e.target.value)}
                        style={{ paddingLeft: '2.2rem', margin: 0, fontSize: '0.82rem', height: '38px' }}
                      />
                    </div>
                    
                    <label 
                      className="filter-btn" 
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        margin: 0,
                        padding: '0 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        height: '38px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Upload width="14" height="14" />
                      Upload Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleImageUpload(activeImageTab, e)} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="form-product-name">Smartphone Name</label>
                  <input
                    type="text"
                    id="form-product-name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Galaxy S25 Ultra"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-product-brand">Brand</label>
                  <select
                    id="form-product-brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="form-product-price">Retail Price (₹)</label>
                  <input
                    type="number"
                    id="form-product-price"
                    value={form.price}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="85000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-product-stock">Stock Level</label>
                  <input
                    type="number"
                    id="form-product-stock"
                    value={form.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-product-description">Marketing Description</label>
                <textarea
                  id="form-product-description"
                  value={form.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the phone features and specifications..."
                />
              </div>

              <h3 style={{ fontSize: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                Technical Specifications
              </h3>
              
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="form-spec-display">Screen Display</label>
                  <input
                    type="text"
                    id="form-spec-display"
                    value={form.specs.display}
                    onChange={handleSpecChange}
                    required
                    placeholder='6.7" AMOLED, 120Hz'
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-spec-processor">Processor Chip</label>
                  <input
                    type="text"
                    id="form-spec-processor"
                    value={form.specs.processor}
                    onChange={handleSpecChange}
                    required
                    placeholder="Snapdragon 8 Gen 4"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="form-spec-ram">RAM Memory</label>
                  <input
                    type="text"
                    id="form-spec-ram"
                    value={form.specs.ram}
                    onChange={handleSpecChange}
                    required
                    placeholder="12 GB"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-spec-storage">Internal Storage</label>
                  <input
                    type="text"
                    id="form-spec-storage"
                    value={form.specs.storage}
                    onChange={handleSpecChange}
                    required
                    placeholder="256 GB / 512 GB"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="form-spec-camera">Camera Array</label>
                  <input
                    type="text"
                    id="form-spec-camera"
                    value={form.specs.camera}
                    onChange={handleSpecChange}
                    required
                    placeholder="50MP Main + 48MP Zoom"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-spec-battery">Battery & Charging</label>
                  <input
                    type="text"
                    id="form-spec-battery"
                    value={form.specs.battery}
                    onChange={handleSpecChange}
                    required
                    placeholder="5000 mAh, 45W Charging"
                  />
                </div>
              </div>

              <div className="form-modal-footer">
                <button 
                  type="button" 
                  className="form-modal-btn cancel" 
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="form-modal-btn save" 
                  id="save-product-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save width="16" height="16" />
                  Save Smartphone
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

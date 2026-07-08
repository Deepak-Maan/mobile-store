import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Eye, Plus, Heart } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { formatINR } from '../utils/currency';

export const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProductId, wishlist, toggleWishlist, compareIds, toggleCompare } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  let stockClass = 'in-stock';
  let stockText = 'In Stock';
  if (product.stock === 0) {
    stockClass = 'out-of-stock';
    stockText = 'Out of Stock';
  } else if (product.stock < 5) {
    stockClass = 'low-stock';
    stockText = `Only ${product.stock} Left`;
  }

  const isOutOfStock = product.stock === 0;

  const cardRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.article 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      layout
      whileHover={{ 
        y: -7, 
        backgroundColor: 'var(--bg-card-hover)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8)'
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="product-card" 
      id={`card-${product.id}`}
    >
      <div className="card-img-wrapper" style={{ position: 'relative' }}>
        <ProductImage src={product.images[0]} alt={product.name} />
        
        {/* Wishlist toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isWishlisted ? 'var(--accent-red)' : '#fff',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          title={isWishlisted ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart width="14" height="14" fill={isWishlisted ? 'var(--accent-red)' : 'none'} stroke={isWishlisted ? 'var(--accent-red)' : '#fff'} />
        </button>

        <div className="badge-overlay">
          {product.featured && <span className="featured-badge">Featured</span>}
          <span className={`stock-badge ${stockClass}`}>{stockText}</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem' }}>
        <span className="card-brand" style={{ margin: 0 }}>{product.brand}</span>
        {product.brand !== 'Aura Accessories' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={isCompared}
              onChange={() => toggleCompare(product.id)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Compare
          </label>
        )}
      </div>

      <h3 className="card-title" style={{ marginTop: '0.2rem' }}>{product.name}</h3>
      <p className="card-desc">{product.description}</p>
      
      <div className="card-footer">
        <span className="card-price">{formatINR(product.price)}</span>
        
        <div className="card-actions">
          <button 
            className="card-btn" 
            title="View details" 
            onClick={() => setSelectedProductId(product.id)}
          >
            <Eye width="18" height="18" />
          </button>
          <button 
            className="card-btn add-to-cart-btn" 
            onClick={() => addToCart(product.id)} 
            disabled={isOutOfStock}
          >
            <Plus width="18" height="18" />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Eye, Plus } from 'lucide-react';
import { ProductImage } from './ProductImage';

export const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProductId } = useStore();

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

  return (
    <motion.article 
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
      <div className="card-img-wrapper">
        {/* Renders the primary front view from the images array */}
        <ProductImage src={product.images[0]} alt={product.name} />
        <div className="badge-overlay">
          {product.featured && <span className="featured-badge">Featured</span>}
          <span className={`stock-badge ${stockClass}`}>{stockText}</span>
        </div>
      </div>
      
      <span className="card-brand">{product.brand}</span>
      <h3 className="card-title">{product.name}</h3>
      <p className="card-desc">{product.description}</p>
      
      <div className="card-footer">
        <span className="card-price">${product.price.toLocaleString()}</span>
        
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

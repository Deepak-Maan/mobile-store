import React from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { formatINR } from '../utils/currency';

// Safe image renderer (handles SVG strings and URL images)
const PhoneThumb = ({ src, alt }) => {
  if (!src || typeof src !== 'string') {
    return <span style={{ fontSize: '1.5rem' }}>📱</span>;
  }
  const isSvg = src.trim().startsWith('<svg') || src.includes('</svg>');
  if (isSvg) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: src }}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.9)' }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onError={(e) => {
        e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: '📱', style: 'font-size:1.5rem' }));
      }}
    />
  );
};

export const RecentlyViewedBar = () => {
  const { recentlyViewed, products, setSelectedProductId } = useStore();

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  const viewedProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="recently-viewed-section">
      <div className="catalog-container">

        {/* Section Header */}
        <div className="recently-viewed-header">
          <div className="recently-viewed-title-row">
            <div className="recently-viewed-icon-wrap">
              <Clock size={16} />
            </div>
            <h2 className="recently-viewed-title">Recently Viewed</h2>
            <div className="recently-viewed-accent-line" />
          </div>
          <p className="recently-viewed-subtitle">
            {viewedProducts.length} phone{viewedProducts.length !== 1 ? 's' : ''} you&apos;ve explored
          </p>
        </div>

        {/* Scrollable Cards Row */}
        <div className="recently-viewed-scroll-track">
          {viewedProducts.map((phone, idx) => (
            <motion.button
              key={phone.id}
              type="button"
              className="rv-card"
              onClick={() => setSelectedProductId(phone.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Image box */}
              <div className="rv-card-img-wrap">
                <PhoneThumb src={phone.images?.[0]} alt={phone.name} />
              </div>

              {/* Text info */}
              <div className="rv-card-body">
                <div className="rv-card-brand">{phone.brand}</div>
                <div className="rv-card-name">{phone.name}</div>
                <div className="rv-card-price">{formatINR(phone.price)}</div>
              </div>

              {/* Arrow hint */}
              <div className="rv-card-arrow">
                <ChevronRight size={14} />
              </div>
            </motion.button>
          ))}
        </div>

      </div>
    </section>
  );
};

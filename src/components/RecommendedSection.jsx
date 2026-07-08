import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { ProductImage } from './ProductImage';

export const RecommendedSection = ({ currentPhone }) => {
  const { products, setSelectedProductId } = useStore();

  const recommendations = useMemo(() => {
    if (!currentPhone) return [];
    return products
      .filter(p => p.id !== currentPhone.id)
      .map(p => {
        let score = 0;
        // Same brand
        if (p.brand === currentPhone.brand) score += 3;
        // Similar price range (within ±25k)
        const priceDiff = Math.abs(p.price - currentPhone.price);
        if (priceDiff < 10000) score += 3;
        else if (priceDiff < 25000) score += 2;
        else if (priceDiff < 50000) score += 1;
        // Not accessories
        if (p.brand !== 'Aura Accessories') score += 1;
        // In stock
        if (p.stock > 0) score += 1;
        return { ...p, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);
  }, [products, currentPhone]);

  if (recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
        <Sparkles size={14} color="var(--primary)" />
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          You May Also Like
        </span>
      </div>

      {/* Recommendation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {recommendations.map((phone, idx) => (
          <motion.button
            key={phone.id}
            type="button"
            onClick={() => setSelectedProductId(phone.id)}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.25 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(99,102,241,0.07)' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            {/* Mini image */}
            <div style={{
              width: '46px',
              height: '56px',
              borderRadius: '6px',
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ProductImage src={phone.images?.[0]} alt={phone.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.1rem' }}>
                {phone.brand}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {phone.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 600 }}>
                {formatINR(phone.price)}
              </div>
            </div>

            <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

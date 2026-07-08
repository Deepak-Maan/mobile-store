import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Check } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { formatINR } from '../utils/currency';

export const AccessoryBuilder = () => {
  const { products, cart, addToCart } = useStore();

  const accessories = products.filter((p) => p.brand === 'Aura Accessories');

  if (accessories.length === 0) return null;

  return (
    <section className="features-container" style={{ marginTop: '2.5rem', marginBottom: '4rem' }}>
      <div className="faq-header" style={{ marginBottom: '2.5rem' }}>
        <span className="faq-badge">Aura Gear</span>
        <h2 className="faq-title" style={{ fontSize: '2.2rem' }}>Enhance Your Mobile Experience</h2>
        <p className="faq-subtitle" style={{ fontSize: '0.95rem' }}>Add premium AURA-engineered chargers, cases, and sound pods to your purchase.</p>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}
      >
        {accessories.map((acc) => {
          const cartItem = cart.find((item) => item.productId === acc.id);
          const isAdded = !!cartItem;

          return (
            <div 
              key={acc.id}
              className="product-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  height: '140px', 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.15)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px'
                }}
              >
                <div style={{ width: '100px', height: '100px' }}>
                  <ProductImage src={acc.images[0]} alt={acc.name} />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{acc.brand}</span>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: '0.2rem 0 0.4rem 0' }}>{acc.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>{acc.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>{formatINR(acc.price)}</span>
                  
                  <button
                    onClick={() => addToCart(acc.id)}
                    disabled={acc.stock === 0}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isAdded ? 'rgba(16, 185, 129, 0.12)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      color: isAdded ? 'var(--accent-green)' : '#fff',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: acc.stock === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: isAdded ? 'none' : '0 4px 12px var(--primary-glow)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check width="13" height="13" strokeWidth={3} />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart width="13" height="13" />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

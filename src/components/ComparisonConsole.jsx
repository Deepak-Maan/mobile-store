import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShoppingCart } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { formatINR } from '../utils/currency';

export const ComparisonConsole = ({ isOpen, onClose }) => {
  const { products, compareIds, toggleCompare, addToCart } = useStore();

  const comparedProducts = products.filter((p) => compareIds.includes(p.id));

  // Find other products to add if list has space
  const availableToCompare = products.filter((p) => !compareIds.includes(p.id));

  if (!isOpen) return null;

  return (
    <div className="form-modal-overlay" style={{ zIndex: 350 }}>
      <div 
        className="form-modal-container" 
        style={{ 
          maxWidth: '900px', 
          width: '95%',
          background: 'var(--bg-card)', 
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div className="form-modal-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Smartphone Comparison Matrix</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Compare structural specifications side-by-side.</p>
          </div>
          <button className="form-modal-close" onClick={onClose}>
            <X width="18" height="18" />
          </button>
        </div>

        {comparedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.92rem', marginBottom: '1.25rem' }}>No smartphones selected for comparison.</p>
            {availableToCompare.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {availableToCompare.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleCompare(p.id)}
                    className="admin-filter-btn"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    + Add {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', width: '200px' }}>Specification</th>
                  {comparedProducts.map((p) => (
                    <th key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top', width: `${700 / comparedProducts.length}px` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                        <button 
                          onClick={() => toggleCompare(p.id)}
                          style={{ position: 'absolute', top: 0, right: 0, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          title="Remove from comparison"
                        >
                          <X width="14" height="14" />
                        </button>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ProductImage src={p.images[0]} alt={p.name} />
                        </div>
                        <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem', paddingRight: '1.25rem' }}>{p.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{p.brand}</span>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty cells if comparing fewer than 3 */}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <th key={`empty-col-${idx}`} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', opacity: 0.35 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty Slot</span>
                        {availableToCompare.length > 0 && (
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                toggleCompare(e.target.value);
                                e.target.value = '';
                              }
                            }}
                            style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', width: '100%', maxWidth: '140px', outline: 'none' }}
                          >
                            <option value="">+ Add Smartphone</option>
                            {availableToCompare.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Price</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '800', color: '#fff', fontSize: '0.88rem' }}>
                      {formatINR(p.price)}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-price-${idx}`} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>—</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Display</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {p.specs.screen}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-screen-${idx}`} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>—</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Processor</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {p.specs.processor}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-proc-${idx}`} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>—</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Camera Setup</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {p.specs.camera}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-cam-${idx}`} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>—</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Battery & Charging</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {p.specs.battery}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-bat-${idx}`} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>—</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Storage Options</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                      {p.specs.storage}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-stor-${idx}`} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>—</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1rem 0 1rem' }}></td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={{ padding: '1rem 1rem 0 1rem' }}>
                      <button
                        onClick={() => {
                          addToCart(p.id);
                          onClose();
                        }}
                        disabled={p.stock === 0}
                        className="nav-btn admin-toggle"
                        style={{
                          width: '100%',
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          background: p.stock === 0 ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          border: 'none',
                          color: '#fff',
                          cursor: p.stock === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ShoppingCart width="14" height="14" />
                        {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, idx) => (
                    <td key={`empty-btn-${idx}`} style={{ padding: '1rem 1rem 0 1rem' }}></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

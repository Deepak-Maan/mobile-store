import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap, Smartphone } from 'lucide-react';
import { formatINR } from '../utils/currency';

// Safe lightweight thumbnail
const SearchThumb = ({ src, alt }) => {
  if (!src || typeof src !== 'string') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Smartphone size={20} color="#6366f1" opacity={0.5} />
      </div>
    );
  }
  const isSvg = src.trim().startsWith('<svg') || src.includes('</svg>');
  if (isSvg) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: src }}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: 'scale(0.9)' }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onError={(e) => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: '📱' })); }}
    />
  );
};

export const SmartSearch = () => {
  const { products, setSelectedProductId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const results = query.trim().length >= 1
    ? products.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.brand?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : [];

  const handleSelect = (product) => {
    setSelectedProductId(product.id);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && activeIndex >= 0) handleSelect(results[activeIndex]);
    else if (e.key === 'Escape') { setIsOpen(false); setActiveIndex(-1); inputRef.current?.blur(); }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const highlight = (text = '', q = '') => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '2px', padding: '0 2px' }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const showDropdown = isOpen && query.trim().length >= 1;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>

      {/* ── Input ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: showDropdown ? '#1e1e2c' : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${showDropdown ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: showDropdown ? '14px 14px 0 0' : '30px',
        padding: '0.48rem 0.9rem',
        transition: 'all 0.2s ease',
        boxShadow: showDropdown ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
      }}>
        <Search size={15} style={{
          color: showDropdown ? '#818cf8' : 'rgba(255,255,255,0.35)',
          flexShrink: 0, transition: 'color 0.2s'
        }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search phones, brands..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: '0.84rem', width: '100%',
            padding: 0, margin: 0,
            '::placeholder': { color: 'rgba(255,255,255,0.25)' }
          }}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              <X size={11} color="rgba(255,255,255,0.6)" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#1e1e2c',
              border: '1.5px solid rgba(99,102,241,0.35)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0 0 16px 16px',
              zIndex: 9999,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 0.9rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(99,102,241,0.07)'
            }}>
              <Zap size={11} color="#818cf8" />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''} found` : 'No results'}
              </span>
            </div>

            {results.length === 0 ? (
              <div style={{ padding: '1.4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔍</div>
                <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                  No results for <strong style={{ color: 'rgba(255,255,255,0.6)' }}>"{query}"</strong>
                </div>
              </div>
            ) : (
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {results.map((product, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <motion.button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelect(product)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
                        padding: '0.7rem 0.9rem',
                        background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                        border: 'none',
                        borderBottom: idx < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.12s'
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: '46px', height: '56px', borderRadius: '8px',
                        background: '#141420', border: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0, overflow: 'hidden', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <SearchThumb src={product.images?.[0]} alt={product.name} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: isActive ? '#818cf8' : 'rgba(99,102,241,0.7)',
                          marginBottom: '0.18rem'
                        }}>
                          {product.brand}
                        </div>
                        <div style={{
                          fontSize: '0.88rem', fontWeight: 600,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          lineHeight: 1.3
                        }}>
                          {highlight(product.name, query)}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.22rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                            {formatINR(product.price)}
                          </span>
                          {product.stock <= 3 && product.stock > 0 && (
                            <span style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(249,115,22,0.1)', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>
                              ⚠ {product.stock} left
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>
                              Sold out
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow hint */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                          style={{
                            fontSize: '0.72rem', color: '#818cf8', fontWeight: 800,
                            flexShrink: 0, background: 'rgba(99,102,241,0.15)',
                            padding: '0.25rem 0.55rem', borderRadius: '99px'
                          }}
                        >
                          Open →
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

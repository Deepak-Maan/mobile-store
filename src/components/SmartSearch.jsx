import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap, Smartphone, Clock, Trash2, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/currency';

// Safe lightweight thumbnail
const SearchThumb = ({ src, alt }) => {
  if (!src || typeof src !== 'string') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Smartphone size={18} color="var(--primary)" opacity={0.5} />
      </div>
    );
  }
  const isSvg = src.trim().startsWith('<svg') || src.includes('</svg>');
  if (isSvg) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: src }}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: 'scale(0.85)' }}
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
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mobile_store_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Keyboard shortcut listener (/ or Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleShortcut = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k') || (e.metaKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  // Filter products using a Spec-Aware and Price-Aware search engine
  const searchResults = query.trim().length >= 1
    ? products.filter(p => {
        const q = query.toLowerCase().trim();
        
        // Basic match (brand, name, description)
        const matchBasic = 
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);

        // Spec-aware match (matches specs key/value e.g. "12GB", "108MP", "Snapdragon")
        const matchSpecs = p.specs ? Object.entries(p.specs).some(([key, val]) => {
          return String(val).toLowerCase().includes(q) || String(key).toLowerCase().includes(q);
        }) : false;

        // Price filtering helper ("under 60000", "below 90000", "above 80000")
        let matchPrice = false;
        if (q.includes('under') || q.includes('below') || q.includes('<')) {
          const limit = parseInt(q.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(limit)) matchPrice = p.price <= limit;
        } else if (q.includes('above') || q.includes('over') || q.includes('>')) {
          const limit = parseInt(q.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(limit)) matchPrice = p.price >= limit;
        }

        return matchBasic || matchSpecs || matchPrice;
      }).slice(0, 6)
    : [];

  const handleSelect = (product) => {
    if (!product) return;
    
    // Save to history
    saveSearchQuery(product.name);

    setSelectedProductId(product.id);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleChipClick = (term) => {
    setQuery(term);
    setIsOpen(true);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const saveSearchQuery = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(x => x.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      localStorage.setItem('mobile_store_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = (e) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('mobile_store_recent_searches');
    inputRef.current?.focus();
  };

  const deleteHistoryItem = (termToDelete, e) => {
    if (e) e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(x => x !== termToDelete);
      localStorage.setItem('mobile_store_recent_searches', JSON.stringify(updated));
      return updated;
    });
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const listToNavigate = query.trim() ? searchResults : recentSearches;

  const handleKeyDown = (e) => {
    if (!isOpen || listToNavigate.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, listToNavigate.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        if (query.trim()) {
          handleSelect(searchResults[activeIndex]);
        } else {
          // Recent search selection
          handleChipClick(recentSearches[activeIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const highlightText = (text = '', q = '') => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'var(--primary-glow)', color: 'var(--text-primary)', borderRadius: '2px', padding: '0 2px' }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const popularSuggestions = ['iPhone 16', 'S24 Ultra', 'Pixel 9', '12GB RAM', 'under 70000', '108MP Camera'];
  const showDropdown = isOpen && (query.trim().length >= 1 || recentSearches.length > 0 || popularSuggestions.length > 0);

  return (
    <>
      {/* Dimmed Blurred Backdrop Overlay — starts BELOW the navbar so the input is never blurred */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: '65px',
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 65px)',
              background: 'rgba(5, 5, 8, 0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 905,
              pointerEvents: 'auto',
            }}
          />
        )}
      </AnimatePresence>

      <div ref={containerRef} className="smart-search-container">
        
        {/* Input Wrapper */}
        <div className={`smart-search-input-wrapper ${showDropdown ? 'active' : ''}`}>
          <Search size={16} className="smart-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search phones, specs..."
            className="smart-search-input"
          />
          <div className="smart-search-actions">
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(''); setIsOpen(true); setActiveIndex(-1); inputRef.current?.focus(); }}
                className="smart-search-clear-btn"
                title="Clear input"
              >
                <X size={12} />
              </button>
            ) : (
              <span className="smart-search-shortcut-pill" title="Press / to focus">/</span>
            )}
          </div>
        </div>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="smart-search-dropdown"
            >
              
              {/* If query has text, show search matches */}
              {query.trim().length >= 1 ? (
                <>
                  <div className="smart-search-dropdown-header">
                    <Zap size={11} color="var(--primary)" />
                    <span className="smart-search-header-text">
                      {searchResults.length > 0 ? `${searchResults.length} Match${searchResults.length !== 1 ? 'es' : ''} Found` : 'No Results'}
                    </span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="smart-search-empty-state">
                      <div className="smart-search-empty-icon">🔍</div>
                      <div style={{ fontSize: '0.84rem' }}>
                        No matches found for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                        Try search terms like: "120Hz", "under 60000", "Apple"
                      </div>
                    </div>
                  ) : (
                    <div className="smart-search-dropdown-scrollable">
                      {searchResults.map((product, idx) => {
                        const isActive = activeIndex === idx;
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelect(product)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`smart-search-item ${isActive ? 'active' : ''}`}
                          >
                            <div className="smart-search-item-thumb">
                              <SearchThumb src={product.images?.[0]} alt={product.name} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="smart-search-item-brand">{product.brand}</div>
                              <div className="smart-search-item-name">
                                {highlightText(product.name, query)}
                              </div>
                              <div className="smart-search-item-meta">
                                <span className="smart-search-item-price">{formatINR(product.price)}</span>
                                {product.stock <= 3 && product.stock > 0 && (
                                  <span className="smart-search-stock-tag low">
                                    ⚠️ {product.stock} units left
                                  </span>
                                )}
                                {product.stock === 0 && (
                                  <span className="smart-search-stock-tag sold-out">
                                    Sold out
                                  </span>
                                )}
                              </div>
                            </div>
                            {isActive && (
                              <div className="smart-search-open-hint">
                                Open <ArrowRight size={10} style={{ marginLeft: '2px', display: 'inline' }} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Focused but empty: show history and popular searches */
                <div className="smart-search-dropdown-scrollable">
                  {/* History section */}
                  {recentSearches.length > 0 && (
                    <>
                      <div className="smart-search-dropdown-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={11} color="var(--primary)" />
                          <span className="smart-search-header-text">Recent Searches</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearHistory}
                          className="smart-search-history-delete"
                          title="Clear all search history"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div style={{ padding: '0.2rem 0' }}>
                        {recentSearches.map((term, idx) => {
                          const isActive = activeIndex === idx;
                          return (
                            <div
                              key={term}
                              onClick={() => handleChipClick(term)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={`smart-search-history-item ${isActive ? 'active' : ''}`}
                            >
                              <div className="smart-search-history-left">
                                <span className="smart-search-history-icon">
                                  <Clock size={12} />
                                </span>
                                <span>{term}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => deleteHistoryItem(term, e)}
                                className="smart-search-history-delete"
                                title="Remove item"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Popular tags */}
                  <div className="smart-search-section-title">Popular Suggestions</div>
                  <div className="smart-search-chips-wrapper">
                    {popularSuggestions.map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleChipClick(term)}
                        className="smart-search-chip"
                      >
                        <Zap size={10} style={{ color: 'var(--primary)' }} />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

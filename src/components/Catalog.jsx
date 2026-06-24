import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Inbox } from 'lucide-react';

export const Catalog = () => {
  const {
    products,
    brandFilter,
    setBrandFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy
  } = useStore();

  const brands = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi'];

  // 1. Filter products by search and brand
  const filteredProducts = products.filter((product) => {
    const matchBrand = brandFilter === 'All' || product.brand === brandFilter;
    const searchString = `${product.name} ${product.brand} ${product.description} ${Object.values(product.specs).join(' ')}`.toLowerCase();
    const matchSearch = searchString.includes(searchQuery.toLowerCase());
    
    return matchBrand && matchSearch;
  });

  // 2. Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else {
      // Featured: featured items first, then by rating/id
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    }
  });

  return (
    <>
      {/* Search and Filters Controls */}
      <div className="controls-container" id="catalog-controls">
        <div className="controls-wrapper">
          <div className="search-box" id="search-box-container">
            <Search className="search-icon" />
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search smartphones by brand, name or specs..."
            />
          </div>

          <div className="filters-box" id="brand-filters-container">
            {brands.map((brand) => (
              <button
                key={brand}
                className={`filter-btn ${brandFilter === brand ? 'active' : ''}`}
                onClick={() => setBrandFilter(brand)}
              >
                {brand === 'All' ? 'All Brands' : brand}
              </button>
            ))}
          </div>

          <select
            className="sort-select"
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Sort: Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Alphabetical: A-Z</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="catalog-container" id="catalog-section">
        <motion.div 
          layout
          className="catalog-grid" 
          id="product-catalog-grid"
        >
          <AnimatePresence mode="popLayout">
            {sortedProducts.length === 0 ? (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="empty-state w-100"
                style={{ gridColumn: '1 / -1' }}
                key="empty-state"
              >
                <Inbox className="empty-icon" />
                <h3>No smartphones found</h3>
                <p>Try adjusting your brand filters, keyword search or sorting order.</p>
              </motion.div>
            ) : (
              sortedProducts.map((phone) => (
                <ProductCard key={phone.id} product={phone} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

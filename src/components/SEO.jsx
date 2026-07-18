import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const SEO = () => {
  const { currentView, selectedProduct, products } = useStore();

  useEffect(() => {
    // 1. Dynamic Meta Title & Description updates
    let title = 'AURA Premium Mobile Store - Shop Next-Gen Smartphones';
    let description = 'Explore and purchase premium mobile devices at the ultimate next-generation smartphone boutique. Fast delivery, secure payments, and interactive 3D unboxing.';

    if (selectedProduct) {
      title = `${selectedProduct.name} (${selectedProduct.brand}) - Buy Online | AURA`;
      const specSummary = selectedProduct.specs 
        ? `${selectedProduct.specs.display || ''}, ${selectedProduct.specs.processor || ''}, ${selectedProduct.specs.camera || ''}`
        : '';
      description = `Buy the new ${selectedProduct.name} at AURA. Specs: ${specSummary}. In stock: ${selectedProduct.stock > 0 ? 'Yes' : 'No'}. Free delivery and secure payments.`;
    } else if (currentView === 'checkout') {
      title = 'Secure Checkout - Complete Your Purchase | AURA';
      description = 'Complete your transaction securely at AURA. Multiple payment modes supported, including UPI, NetBanking, and Card options.';
    } else if (currentView === 'tracking') {
      title = 'Track Your Order Status - Real-Time Tracking | AURA';
      description = 'Enter your Order ID to track the real-time fulfillment status, logistics location updates, and delivery schedules.';
    } else if (currentView === 'history') {
      title = 'Your Order History - Customer Portal | AURA';
      description = 'View your past smartphone purchases, tracking history, invoice details, and customer profiles.';
    } else if (currentView === 'admin') {
      title = 'AURA Operations - Administrative Control Hub';
      description = 'Secure operations dashboard for inventory planning, sales analytics, shopper managers, and system audit logs.';
    }

    // Apply to page DOM
    document.title = title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', description);
    }

    // Update OpenGraph Title / Desc too
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // 2. Dynamic JSON-LD Structured Data Schema Insertion
    const scriptId = 'aura-jsonld-schema';
    let existingScript = document.getElementById(scriptId);
    
    if (existingScript) {
      existingScript.remove();
    }

    const schemas = [];

    // Always inject Organization & SearchBox Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'AURA Mobile Store',
      'url': window.location.origin,
      'logo': `${window.location.origin}/favicon.svg`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-1800-AURA-MOB',
        'contactType': 'customer service'
      }
    });

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'AURA Premium Mobile Boutique',
      'url': window.location.origin,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${window.location.origin}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    });

    // Inject Product-specific JSON-LD if viewing a single smartphone
    if (selectedProduct) {
      const productImage = selectedProduct.images && selectedProduct.images[0] 
        ? (selectedProduct.images[0].startsWith('http') ? selectedProduct.images[0] : `${window.location.origin}${selectedProduct.images[0]}`)
        : `${window.location.origin}/favicon.svg`;

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': selectedProduct.name,
        'image': productImage,
        'description': selectedProduct.description || `Premium ${selectedProduct.name} smartphone by ${selectedProduct.brand}.`,
        'brand': {
          '@type': 'Brand',
          'name': selectedProduct.brand
        },
        'offers': {
          '@type': 'Offer',
          'url': `${window.location.origin}/#product-${selectedProduct.id}`,
          'priceCurrency': 'INR',
          'price': selectedProduct.price,
          'itemCondition': 'https://schema.org/NewCondition',
          'availability': selectedProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      });
    } else {
      // Otherwise inject a product collection (ItemList) schema of the Catalog
      const itemsList = (products || []).map((p, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'url': `${window.location.origin}/#product-${p.id}`,
        'name': p.name
      }));

      if (itemsList.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'Featured Smartphones at AURA',
          'numberOfItems': itemsList.length,
          'itemListElement': itemsList
        });
      }
    }

    // Append to Head
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemas);
    document.head.appendChild(script);

  }, [currentView, selectedProduct, products]);

  return null; // pure behavior, no visual render needed
};

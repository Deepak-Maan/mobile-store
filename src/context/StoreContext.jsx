import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const StoreContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('aura_theme') || 'dark');
  const [compareIds, setCompareIds] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedForLater, setSavedForLater] = useState(() => {
    const stored = localStorage.getItem('mobile_store_saved_for_later');
    return stored ? JSON.parse(stored) : [];
  });
  
  const warnedLowStockRef = useRef(new Set());
  
  // Auth state
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  const handleAuthFailure = () => {
    const isUser = !!sessionStorage.getItem('mobile_store_active_user');
    const isAdmin = !!sessionStorage.getItem('mobile_store_admin_active');
    
    if (isUser) {
      setCurrentUser(null);
      setUserToken(null);
      sessionStorage.removeItem('mobile_store_active_user');
      sessionStorage.removeItem('mobile_store_user_token');
      addToast('Session expired. Please log in again.', 'error');
    }
    if (isAdmin) {
      setIsAdminLoggedIn(false);
      setAdminToken(null);
      sessionStorage.removeItem('mobile_store_admin_active');
      sessionStorage.removeItem('mobile_store_admin_token');
      window.location.hash = '';
      setCurrentView('storefront');
      addToast('Admin session expired. Please log in again.', 'error');
    }
  };

  const checkResponseStatus = async (res) => {
    if (res.status === 401) {
      handleAuthFailure();
      return false;
    }
    if (res.status === 403) {
      try {
        const data = await res.clone().json();
        if (data && data.error && (data.error.includes('Session expired') || data.error.includes('invalid token'))) {
          handleAuthFailure();
          return false;
        }
      } catch {
        // ignore
      }
    }
    return true;
  };
  
  const [currentView, setCurrentView] = useState('storefront');
  const [adminPanel, setAdminPanel] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  
  // Filtering state
  const [brandFilter, setBrandFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // --- API GETTERS ---
  async function fetchProducts() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        
        // Low Stock Alerting (triggered exactly once per product per browser lifecycle)
        data.forEach((p) => {
          if (p.stock > 0 && p.stock < 3 && !warnedLowStockRef.current.has(p.id)) {
            addToast(`Low Stock Alert: Only ${p.stock} units left for ${p.name}!`, 'warning');
            warnedLowStockRef.current.add(p.id);
          }
        });
      } else {
        console.error('Failed to load products from server');
      }
    } catch (err) {
      console.error('Failed to connect to server for products:', err);
    } finally {
      // 550ms delay for visual shimmer loader stability
      setTimeout(() => {
        setIsLoading(false);
      }, 550);
    }
  }

  const fetchUsers = async (tokenOverride) => {
    const token = tokenOverride || adminToken || userToken || sessionStorage.getItem('mobile_store_admin_token') || sessionStorage.getItem('mobile_store_user_token');
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRegisteredUsers(data);
      } else {
        console.error('Failed to load users from server');
        await checkResponseStatus(res);
      }
    } catch (err) {
      console.error('Failed to connect to server for users:', err);
    }
  };

  const fetchOrders = async (tokenOverride) => {
    const token = tokenOverride || adminToken || userToken || sessionStorage.getItem('mobile_store_admin_token') || sessionStorage.getItem('mobile_store_user_token');
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/orders`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        return data;
      } else {
        console.error('Failed to load orders from server');
        await checkResponseStatus(res);
        return [];
      }
    } catch (err) {
      console.error('Failed to connect to server for orders:', err);
      return [];
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load active sessions from sessionStorage (retains refresh-persistence)
    const storedUserSession = sessionStorage.getItem('mobile_store_active_user');
    const storedUserToken = sessionStorage.getItem('mobile_store_user_token');
    if (storedUserSession && storedUserToken) {
      setCurrentUser(JSON.parse(storedUserSession));
      setUserToken(storedUserToken);
    }

    const storedAdminSession = sessionStorage.getItem('mobile_store_admin_active');
    const storedAdminToken = sessionStorage.getItem('mobile_store_admin_token');
    if (storedAdminSession && storedAdminToken) {
      setIsAdminLoggedIn(JSON.parse(storedAdminSession));
      setAdminToken(storedAdminToken);
    }

    const activeToken = storedAdminToken || storedUserToken;

    // Fetch all database records from the backend
    fetchProducts();
    if (storedAdminToken) {
      fetchUsers(storedAdminToken);
    }
    if (activeToken) {
      fetchOrders(activeToken);
    }

    // Load local cart from localStorage (retains instant client-side cart experience)
    const storedCart = localStorage.getItem('mobile_store_cart_react_hybrid');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    } else {
      setCart([]);
    }

    // Load wishlist
    const storedWish = localStorage.getItem('mobile_store_wishlist_react');
    if (storedWish) {
      setWishlist(JSON.parse(storedWish));
    }

    // Theme preference and persistence is managed by a separate useEffect hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme Sync effect
  useEffect(() => {
    localStorage.setItem('aura_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Saved For Later Sync effect
  useEffect(() => {
    localStorage.setItem('mobile_store_saved_for_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  // Recently Viewed Sync effect
  useEffect(() => {
    if (selectedProductId) {
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((id) => id !== selectedProductId);
        return [selectedProductId, ...filtered].slice(0, 5);
      });
    }
  }, [selectedProductId]);

  // --- HASH ROUTING SYNC ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('storefront');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- TOAST ALERTS ---
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- VIEW NAVIGATION ---
  const switchView = (view) => {
    if (view === 'admin') {
      window.location.hash = '#/admin';
    } else {
      if (window.location.hash === '#/admin') {
        window.location.hash = '';
      }
      setCurrentView(view);
      if (view === 'storefront') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const switchAdminPanel = (panel) => {
    setAdminPanel(panel);
  };

  // --- USER AUTHENTICATION ACTIONS ---
  const signUpUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to register account.', 'error');
        return false;
      }

      setCurrentUser(data.user);
      setUserToken(data.token);
      sessionStorage.setItem('mobile_store_active_user', JSON.stringify(data.user));
      sessionStorage.setItem('mobile_store_user_token', data.token);
      addToast(`Account created! Welcome, ${data.user.firstName}`, 'success');
      
      // Refresh local users list if possible
      fetchUsers(data.token);
      return true;
    } catch {
      addToast('Server connection error during registration.', 'error');
      return false;
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Invalid email or password details.', 'error');
        return false;
      }

      setCurrentUser(data.user);
      setUserToken(data.token);
      sessionStorage.setItem('mobile_store_active_user', JSON.stringify(data.user));
      sessionStorage.setItem('mobile_store_user_token', data.token);
      addToast(`Logged in successfully. Welcome back, ${data.user.firstName}!`, 'success');
      
      // Load user orders immediately
      fetchOrders(data.token);
      return true;
    } catch {
      addToast('Server connection error during login.', 'error');
      return false;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setUserToken(null);
    sessionStorage.removeItem('mobile_store_active_user');
    sessionStorage.removeItem('mobile_store_user_token');
    addToast('Logged out of your profile session.', 'warning');
  };

  // --- ADMINISTRATOR USER MANAGEMENT ACTIONS ---
  const saveUser = async (userData) => {
    const activeToken = adminToken || userToken || sessionStorage.getItem('mobile_store_admin_token') || sessionStorage.getItem('mobile_store_user_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`${API_BASE}/users`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to update user profile.', 'error');
        await checkResponseStatus(res);
        return;
      }

      // Sync local users list
      await fetchUsers(activeToken);
      
      const emailKey = userData.email.toLowerCase().trim();
      
      // If the currently logged-in user is updated, sync their details or log them out if deactivated!
      if (currentUser && currentUser.email.toLowerCase().trim() === emailKey) {
        if (userData.isActive === false) {
          logoutUser();
          addToast('Your account has been deactivated by an administrator.', 'warning');
        } else {
          setCurrentUser(data.user);
          sessionStorage.setItem('mobile_store_active_user', JSON.stringify(data.user));
        }
      }
      
      addToast(`Successfully updated profile for ${userData.firstName}.`, 'success');
    } catch {
      addToast('Server connection error while saving user profile.', 'error');
    }
  };

  const toggleUserActive = async (email) => {
    const activeToken = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/toggle-active`, {
        method: 'PATCH',
        headers
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to toggle user status.', 'error');
        await checkResponseStatus(res);
        return;
      }

      // Sync local users list
      await fetchUsers(activeToken);

      const newActiveState = data.isActive;
      
      // If deactivating the currently logged-in user, log them out!
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase() && !newActiveState) {
        logoutUser();
        addToast('Your account has been deactivated by an administrator.', 'warning');
      } else {
        addToast(
          `User "${data.firstName}" has been ${newActiveState ? 'activated' : 'deactivated'}.`,
          newActiveState ? 'success' : 'warning'
        );
      }
    } catch {
      addToast('Server connection error while toggling user status.', 'error');
    }
  };

  // --- ADMIN AUTHENTICATION ACTIONS ---
  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Invalid administrator credentials.', 'error');
        return false;
      }

      setIsAdminLoggedIn(true);
      setAdminToken(data.token);
      sessionStorage.setItem('mobile_store_admin_active', JSON.stringify(true));
      sessionStorage.setItem('mobile_store_admin_token', data.token);
      addToast('Access granted. Welcome, Administrator.', 'success');
      
      // Load administrative data using token directly
      await fetchUsers(data.token);
      await fetchOrders(data.token);
      return true;
    } catch {
      addToast('Server connection error during administrator login.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminToken(null);
    sessionStorage.removeItem('mobile_store_admin_active');
    sessionStorage.removeItem('mobile_store_admin_token');
    window.location.hash = '';
    setCurrentView('storefront');
    addToast('Administrator session terminated.', 'warning');
  };

  // --- CART OPERATIONS (Local-first, instant, browser-persisted) ---
  const addToCart = (productId, options = {}) => {
    const phone = products.find((p) => p.id === productId);
    if (!phone) return;

    if (phone.stock === 0) {
      addToast(`${phone.name} is currently out of stock.`, 'error');
      return;
    }

    const isAccessory = phone.brand === 'Aura Accessories';
    const storage = isAccessory ? '' : (options.storage || '128GB');
    const color = isAccessory ? '' : (options.color || 'Obsidian Black');

    const existingCartItem = cart.find(
      (item) => item.productId === productId && item.storage === storage && item.color === color
    );
    let updatedCart = [];

    if (existingCartItem) {
      if (existingCartItem.quantity >= phone.stock) {
        addToast(`Cannot add more. Only ${phone.stock} units available in stock.`, 'warning');
        return;
      }
      updatedCart = cart.map((item) =>
        item.productId === productId && item.storage === storage && item.color === color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { productId, quantity: 1, storage, color }];
    }

    setCart(updatedCart);
    localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify(updatedCart));
    
    const variantDesc = isAccessory ? '' : ` (${storage} • ${color})`;
    addToast(`Added ${phone.name}${variantDesc} to cart.`, 'success');
  };

  const updateCartQuantity = (productId, storage, color, delta) => {
    const cartItem = cart.find(
      (item) => item.productId === productId && item.storage === storage && item.color === color
    );
    const phone = products.find((p) => p.id === productId);

    if (!cartItem || !phone) return;

    const newQty = cartItem.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(productId, storage, color);
      return;
    }

    if (newQty > phone.stock) {
      addToast(`Sorry, only ${phone.stock} units are in stock.`, 'warning');
      return;
    }

    const updatedCart = cart.map((item) =>
      item.productId === productId && item.storage === storage && item.color === color
        ? { ...item, quantity: newQty }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId, storage, color) => {
    const phone = products.find((p) => p.id === productId);
    const name = phone ? phone.name : 'Item';

    const updatedCart = cart.filter(
      (item) => !(item.productId === productId && item.storage === storage && item.color === color)
    );
    setCart(updatedCart);
    localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify(updatedCart));
    
    const variantDesc = (storage || color) ? ` (${storage} • ${color})` : '';
    addToast(`Removed ${name}${variantDesc} from cart.`, 'warning');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify([]));
  };

  const saveForLater = (productId, storage, color) => {
    const itemToSave = cart.find(
      (item) => item.productId === productId && item.storage === storage && item.color === color
    );
    if (!itemToSave) return;

    const updatedCart = cart.filter(
      (item) => !(item.productId === productId && item.storage === storage && item.color === color)
    );
    setCart(updatedCart);
    localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify(updatedCart));

    const exists = savedForLater.some(
      (item) => item.productId === productId && item.storage === storage && item.color === color
    );
    if (!exists) {
      setSavedForLater([...savedForLater, { ...itemToSave }]);
    }
    
    const prod = products.find((p) => p.id === productId);
    const name = prod ? prod.name : 'Item';
    addToast(`Saved ${name} for later.`, 'success');
  };

  const moveToCart = (productId, storage, color) => {
    const itemToMove = savedForLater.find(
      (item) => item.productId === productId && item.storage === storage && item.color === color
    );
    if (!itemToMove) return;

    const updatedSaved = savedForLater.filter(
      (item) => !(item.productId === productId && item.storage === storage && item.color === color)
    );
    setSavedForLater(updatedSaved);

    const phone = products.find((p) => p.id === productId);
    if (!phone) return;

    if (phone.stock === 0) {
      addToast(`${phone.name} is out of stock. Cannot move to cart.`, 'error');
      return;
    }

    const existingCartItem = cart.find(
      (item) => item.productId === productId && item.storage === storage && item.color === color
    );
    let updatedCart = [];

    if (existingCartItem) {
      const newQty = existingCartItem.quantity + itemToMove.quantity;
      const finalQty = Math.min(newQty, phone.stock);
      if (newQty > phone.stock) {
        addToast(`Only ${phone.stock} units available in stock. Quantity adjusted.`, 'warning');
      }
      updatedCart = cart.map((item) =>
        item.productId === productId && item.storage === storage && item.color === color
          ? { ...item, quantity: finalQty }
          : item
      );
    } else {
      updatedCart = [...cart, { ...itemToMove }];
    }

    setCart(updatedCart);
    localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify(updatedCart));

    addToast(`Moved ${phone.name} back to cart.`, 'success');
  };

  const removeFromSavedForLater = (productId, storage, color) => {
    const updatedSaved = savedForLater.filter(
      (item) => !(item.productId === productId && item.storage === storage && item.color === color)
    );
    setSavedForLater(updatedSaved);
    const prod = products.find((p) => p.id === productId);
    const name = prod ? prod.name : 'Item';
    addToast(`Removed ${name} from saved items.`, 'warning');
  };

  // --- CHECKOUT & ORDER PROCESSING ---
  const processOrder = async (shippingForm, discountCode = '') => {
    if (cart.length === 0) return false;

    const token = userToken || sessionStorage.getItem('mobile_store_user_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shippingForm,
          cart,
          userEmail: currentUser ? currentUser.email : 'guest',
          discountCode
        })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Order processing failed.', 'error');
        await checkResponseStatus(res);
        return false;
      }

      // Sync products (reflecting stock deductions) and orders list
      await fetchProducts();
      await fetchOrders(token);
      
      // Clear local cart
      clearCart();
      
      switchView('success');
      addToast('Thank you! Order placed successfully.', 'success');
      return data.order;
    } catch {
      addToast('Server connection error during order checkout.', 'error');
      return false;
    }
  };

  // --- ADMINISTRATOR PRODUCT MANAGEMENT (CRUD) ---
  const saveProduct = async (productData) => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData)
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to save product.', 'error');
        await checkResponseStatus(res);
        return;
      }

      // Sync local products list
      await fetchProducts();
      addToast(productData.id ? 'Updated smartphone specifications.' : `Created new product: ${productData.name}`, 'success');
    } catch {
      addToast('Server connection error while saving product specifications.', 'error');
    }
  };

  const deleteProduct = async (productId) => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to delete product.', 'error');
        await checkResponseStatus(res);
        return;
      }

      // Sync local products list
      await fetchProducts();
      
      // Remove deleted item from local cart if present
      const updatedCart = cart.filter((item) => item.productId !== productId);
      if (updatedCart.length !== cart.length) {
        setCart(updatedCart);
        localStorage.setItem('mobile_store_cart_react_hybrid', JSON.stringify(updatedCart));
      }

      addToast('Deleted smartphone from inventory.', 'warning');
    } catch {
      addToast('Server connection error while deleting product.', 'error');
    }
  };

  // --- ADMINISTRATOR ORDER STATUS UPDATES ---
  const changeOrderStatus = async (orderId, newStatus) => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to change order status.', 'error');
        await checkResponseStatus(res);
        return;
      }

      // Sync products (refunded/deducted stock) and orders list
      await fetchProducts();
      await fetchOrders(token);

      addToast(`Order ${orderId} status changed to ${newStatus}.`, newStatus === 'cancelled' ? 'warning' : 'success');
    } catch {
      addToast('Server connection error while updating order status.', 'error');
    }
  };

  // --- ADMINISTRATOR TRACKING UPDATES ---
  const addTrackingUpdate = async (orderId, location, note, status) => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ location, note, status })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to add tracking update.', 'error');
        await checkResponseStatus(res);
        return false;
      }

      await fetchProducts();
      await fetchOrders(token);
      addToast(`Tracking update added to ${orderId}.`, 'success');
      return true;
    } catch {
      addToast('Server connection error while adding tracking update.', 'error');
      return false;
    }
  };

  const cancelOrderWithReason = async (orderId, reason) => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ reason })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to cancel order.', 'error');
        await checkResponseStatus(res);
        return false;
      }

      await fetchProducts();
      await fetchOrders(token);
      addToast(`Order ${orderId} has been cancelled.`, 'warning');
      return true;
    } catch {
      addToast('Server connection error while cancelling order.', 'error');
      return false;
    }
  };

  const backupDatabase = async () => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    if (!token) {
      addToast('Administrator privileges required.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/backup`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        addToast('Failed to download backup.', 'error');
        await checkResponseStatus(res);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aura_db_backup.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast('Database backup downloaded successfully.', 'success');
    } catch {
      addToast('Failed to initiate backup download.', 'error');
    }
  };

  const restoreDatabase = async (backupData) => {
    const token = adminToken || sessionStorage.getItem('mobile_store_admin_token');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/restore`, {
        method: 'POST',
        headers,
        body: JSON.stringify(backupData)
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Database backup successfully restored!', 'success');
        await fetchProducts();
        await fetchUsers(token);
        await fetchOrders(token);
        return true;
      } else {
        addToast(data.error || 'Failed to restore database.', 'error');
        await checkResponseStatus(res);
        return false;
      }
    } catch {
      addToast('Error communicating with restoration server.', 'error');
      return false;
    }
  };

  const toggleWishlist = (productId) => {
    let updated = [];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
      addToast('Removed from favorites.', 'warning');
    } else {
      updated = [...wishlist, productId];
      const prod = products.find((p) => p.id === productId);
      const name = prod ? prod.name : 'Item';
      addToast(`Added ${name} to favorites.`, 'success');
    }
    setWishlist(updated);
    localStorage.setItem('mobile_store_wishlist_react', JSON.stringify(updated));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleCompare = (productId) => {
    if (compareIds.includes(productId)) {
      setCompareIds(compareIds.filter((id) => id !== productId));
    } else {
      if (compareIds.length >= 3) {
        addToast('You can compare a maximum of 3 smartphones side-by-side.', 'warning');
        return;
      }
      setCompareIds([...compareIds, productId]);
      addToast('Added to comparison list.', 'success');
    }
  };

  // --- CONTEXT EXPORTS ---
  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        currentView,
        adminPanel,
        selectedProductId,
        brandFilter,
        searchQuery,
        sortBy,
        toasts,
        isLoading,
        wishlist,
        theme,
        compareIds,
        setCompareIds,
        recentlyViewed,
        savedForLater,
        saveForLater,
        moveToCart,
        removeFromSavedForLater,
        
        // Auth states
        registeredUsers,
        currentUser,
        isAdminLoggedIn,
        trackingOrderId,
        setTrackingOrderId,
        
        switchView,
        switchAdminPanel,
        setSelectedProductId,
        setBrandFilter,
        setSearchQuery,
        setSortBy,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        processOrder,
        saveProduct,
        deleteProduct,
        changeOrderStatus,
        addTrackingUpdate,
        cancelOrderWithReason,
        fetchOrders,
        addToast,
        removeToast,
        backupDatabase,
        restoreDatabase,
        toggleWishlist,
        toggleTheme,
        toggleCompare,
        
        // Auth actions
        signUpUser,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        saveUser,
        toggleUserActive
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

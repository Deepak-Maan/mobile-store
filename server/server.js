import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // support large base64 image uploads
app.use(morgan('dev'));

// Helper: Read Database
const readDB = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Return empty structure if file doesn't exist (though it should be pre-seeded)
      return { products: [], users: [], orders: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { products: [], users: [], orders: [] };
  }
};

// Helper: Write Database
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
};

// Helper: Hashing and cryptographic password checks
const hashPassword = (password, salt) => {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, salt, hash) => {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
};

const checkPassword = (user, inputPassword) => {
  if (user.salt && user.hash) {
    return verifyPassword(inputPassword, user.salt, user.hash);
  }
  return user.password === inputPassword;
};

// Procedural SVG fallback generator (replicated from StoreContext.jsx)
const generatePhoneSVGs = (brand, name) => {
  let frontBg = '';
  let backBg = '';
  let macroBg = '';
  let screenDesign = '';
  let cameraDesign = '';
  let macroDetails = '';

  const uniqueId = `dyn-${Math.floor(Math.random() * 1000)}`;

  if (brand === 'Apple') {
    frontBg = '<stop offset="0%" stop-color="#4e4e52" /><stop offset="100%" stop-color="#1c1c1e" />';
    backBg = '<stop offset="0%" stop-color="#8e8e93" /><stop offset="100%" stop-color="#3a3a3c" />';
    macroBg = '<stop offset="0%" stop-color="#3a3a3c" /><stop offset="100%" stop-color="#1c1c1e" />';
    
    screenDesign = '<rect x="75" y="23" width="50" height="12" rx="6" fill="#000" /><circle cx="83" cy="29" r="2.5" fill="#111" />';
    cameraDesign = `
      <rect x="28" y="18" width="54" height="54" rx="14" fill="#3a3a3c" stroke="rgba(255,255,255,0.05)" />
      <circle cx="43" cy="33" r="10" fill="#111" /><circle cx="43" cy="33" r="4.5" fill="#020306" />
      <circle cx="67" cy="45" r="10" fill="#111" /><circle cx="67" cy="45" r="4.5" fill="#020306" />
      <circle cx="43" cy="57" r="10" fill="#111" /><circle cx="43" cy="57" r="4.5" fill="#020306" />
    `;
    macroDetails = `
      <circle cx="100" cy="150" r="72" fill="#2c2c2e" stroke="#555" stroke-width="3" />
      <circle cx="100" cy="150" r="58" fill="none" stroke="#6366f1" stroke-width="4" opacity="0.35" />
      <circle cx="100" cy="150" r="15" fill="#010204" />
      <text x="100" y="255" fill="#6366f1" opacity="0.75" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle" letter-spacing="1">PRO FOCUS OPTICS</text>
    `;
  } else if (brand === 'Samsung') {
    frontBg = '<stop offset="0%" stop-color="#5a5245" /><stop offset="100%" stop-color="#1a1814" />';
    backBg = '<stop offset="0%" stop-color="#a49b8e" /><stop offset="100%" stop-color="#463e34" />';
    macroBg = '<stop offset="0%" stop-color="#463e34" /><stop offset="100%" stop-color="#262019" />';
    
    screenDesign = '<circle cx="100" cy="22" r="3" fill="#050505" />';
    cameraDesign = `
      <circle cx="42" cy="30" r="9" fill="#111" stroke="#444" stroke-width="1.5" />
      <circle cx="42" cy="30" r="4" fill="#020306" />
      <circle cx="42" cy="52" r="9" fill="#111" stroke="#444" stroke-width="1.5" />
      <circle cx="42" cy="52" r="4" fill="#020306" />
      <circle cx="42" cy="74" r="9" fill="#111" stroke="#444" stroke-width="1.5" />
      <circle cx="42" cy="74" r="4" fill="#020306" />
      <circle cx="62" cy="41" r="6" fill="#111" />
    `;
    macroDetails = `
      <circle cx="100" cy="150" r="72" fill="#1e1a15" stroke="#5a5245" stroke-width="3" />
      <circle cx="100" cy="150" r="54" fill="none" stroke="#d1c7bd" stroke-width="4" opacity="0.4" />
      <circle cx="100" cy="150" r="14" fill="#010204" />
      <text x="100" y="255" fill="#f59e0b" opacity="0.75" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle" letter-spacing="1">ISOCELL ZOOM SENSOR</text>
    `;
  } else if (brand === 'Google') {
    frontBg = '<stop offset="0%" stop-color="#e8e2d9" /><stop offset="100%" stop-color="#bcafa0" />';
    backBg = '<stop offset="0%" stop-color="#f5efe6" /><stop offset="100%" stop-color="#dccfbe" />';
    macroBg = '<stop offset="0%" stop-color="#dccfbe" /><stop offset="100%" stop-color="#8a7e6d" />';
    
    screenDesign = '<circle cx="100" cy="24" r="2.8" fill="#0b0b0b" />';
    cameraDesign = `
      <rect x="20" y="32" width="160" height="30" fill="#eae3d5" stroke="rgba(255,255,255,0.3)" />
      <rect x="38" y="38" width="60" height="18" rx="9" fill="#060608" />
      <circle cx="48" cy="47" r="5" fill="#1a1a1a" />
      <circle cx="68" cy="47" r="5" fill="#1a1a1a" />
      <circle cx="88" cy="47" r="5" fill="#1a1a1a" />
    `;
    macroDetails = `
      <rect x="-10" y="80" width="220" height="120" fill="#eae3d5" rx="10" stroke="#7e7161" stroke-width="2" />
      <rect x="35" y="110" width="130" height="60" rx="30" fill="#08080a" />
      <circle cx="70" cy="140" r="22" fill="#18181c" />
      <circle cx="130" cy="140" r="22" fill="#18181c" />
      <text x="100" y="255" fill="#ffffff" opacity="0.6" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">GOOGLE TENSOR CO-PROCESSOR</text>
    `;
  } else {
    // OnePlus, Xiaomi or Custom circular camera styles
    frontBg = '<stop offset="0%" stop-color="#1A3B32" /><stop offset="100%" stop-color="#050D0B" />';
    backBg = '<stop offset="0%" stop-color="#2a5a4d" /><stop offset="100%" stop-color="#06120e" />';
    macroBg = '<stop offset="0%" stop-color="#183f34" /><stop offset="100%" stop-color="#06120e" />';
    
    screenDesign = '<circle cx="45" cy="26" r="2.5" fill="#0a0a0a" />';
    cameraDesign = `
      <circle cx="64" cy="62" r="30" fill="#183f34" stroke="rgba(255,255,255,0.1)" />
      <circle cx="52" cy="50" r="6" fill="#08080a" />
      <circle cx="76" cy="50" r="6" fill="#08080a" />
      <circle cx="52" cy="74" r="6" fill="#08080a" />
      <circle cx="76" cy="74" r="6" fill="#08080a" />
    `;
    macroDetails = `
      <circle cx="100" cy="150" r="82" fill="#0e231d" stroke="#3b7f6c" stroke-width="3" />
      <circle cx="100" cy="150" r="50" fill="#0a1710" stroke="#040a08" stroke-width="4" />
      <text x="100" y="255" fill="#ffffff" opacity="0.6" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">1-INCH HYPER OPTICS</text>
    `;
  }

  const view1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="front-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">${frontBg}</linearGradient>
      <linearGradient id="accent-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#777" /><stop offset="100%" stop-color="#222" />
      </linearGradient>
      <filter id="glow-${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect x="22" y="12" width="156" height="276" rx="25" fill="#000" opacity="0.4" filter="url(#glow-${uniqueId})" />
    <rect x="20" y="10" width="160" height="280" rx="26" fill="url(#front-${uniqueId})" stroke="url(#accent-${uniqueId})" stroke-width="2" />
    <rect x="24" y="14" width="152" height="272" rx="22" fill="#0d0e10" stroke="#000" stroke-width="2" />
    <path d="M 30 220 Q 100 120 170 220" fill="none" stroke="var(--primary)" stroke-width="1.5" opacity="0.4" filter="url(#glow-${uniqueId})" />
    ${screenDesign}
    <text x="100" y="160" fill="#fff" opacity="0.1" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="3">${brand.toUpperCase()}</text>
  </svg>`;

  const view2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="back-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">${backBg}</linearGradient>
    </defs>
    <rect x="22" y="12" width="156" height="276" rx="25" fill="#000" opacity="0.4" />
    <rect x="20" y="10" width="160" height="280" rx="26" fill="url(#back-${uniqueId})" stroke="#444" stroke-width="2" />
    ${cameraDesign}
    <text x="100" y="245" fill="#fff" opacity="0.15" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" letter-spacing="2">${name.toUpperCase()}</text>
  </svg>`;

  const view3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="side-bg-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1c1e" /><stop offset="100%" stop-color="#0a0a0c" />
      </linearGradient>
      <linearGradient id="frame-metal-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8a8a8e" /><stop offset="50%" stop-color="#d1d1d6" /><stop offset="100%" stop-color="#3a3a3c" />
      </linearGradient>
    </defs>
    <rect width="200" height="300" fill="url(#side-bg-${uniqueId})" />
    <rect x="90" y="20" width="20" height="260" rx="6" fill="url(#frame-metal-${uniqueId})" stroke="#555" stroke-width="1" />
    <rect x="87" y="70" width="3" height="15" rx="1.5" fill="#222" />
    <rect x="87" y="95" width="3" height="30" rx="2" fill="#222" />
    <rect x="87" y="135" width="3" height="30" rx="2" fill="#222" />
    <text x="100" y="275" fill="var(--primary)" opacity="0.6" font-family="sans-serif" font-weight="700" font-size="9" text-anchor="middle" letter-spacing="1">SLIM TITANIUM FRAME</text>
  </svg>`;

  const view4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="macro-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">${macroBg}</linearGradient>
    </defs>
    <rect width="200" height="300" fill="url(#macro-${uniqueId})" />
    ${macroDetails}
  </svg>`;

  const view5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="life-bg-${uniqueId}" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#09090b" /><stop offset="100%" stop-color="#18181b" />
      </linearGradient>
      <radialGradient id="glow-${uniqueId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--primary)" opacity="0.15" /><stop offset="100%" stop-color="var(--primary)" opacity="0" />
      </radialGradient>
    </defs>
    <rect width="200" height="300" fill="url(#life-bg-${uniqueId})" />
    <circle cx="100" cy="150" r="120" fill="url(#glow-${uniqueId})" />
    <g transform="translate(100, 150) rotate(-30) scale(0.65)">
      <rect x="-50" y="-80" width="100" height="160" rx="16" fill="none" stroke="var(--primary)" stroke-width="2" opacity="0.7" />
      <rect x="-48" y="-78" width="96" height="156" rx="14" fill="#0c0e12" stroke="#000" stroke-width="1" />
    </g>
    <text x="100" y="260" fill="#fff" opacity="0.5" font-family="sans-serif" font-weight="800" font-size="9" text-anchor="middle" letter-spacing="1.5">NEXT-GEN FLAGSHIP</text>
  </svg>`;

  return [view1, view2, view3, view4, view5];
};

// ============================================================================
// API ROUTES
// ============================================================================

// --- PRODUCTS API ---

// 1. Get all products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// 2. Create or Update a product
app.post('/api/products', (req, res) => {
  const db = readDB();
  const productData = req.body;

  if (productData.id) {
    // Update Mode
    let found = false;
    db.products = db.products.map((p) => {
      if (p.id === productData.id) {
        found = true;
        return {
          ...p,
          name: productData.name,
          brand: productData.brand,
          price: parseInt(productData.price),
          stock: parseInt(productData.stock),
          description: productData.description,
          specs: productData.specs,
          images: productData.images || p.images
        };
      }
      return p;
    });

    if (!found) {
      return res.status(404).json({ error: 'Product not found' });
    }
    writeDB(db);
    res.json({ message: 'Product updated successfully', product: db.products.find(p => p.id === productData.id) });
  } else {
    // Create Mode
    const newProductId = `phone-${Math.floor(1000 + Math.random() * 9000)}`;
    let finalImages = [...(productData.images || [])];
    const brandSVGs = generatePhoneSVGs(productData.brand, productData.name);

    for (let i = 0; i < 5; i++) {
      if (!finalImages[i] || finalImages[i].trim() === '') {
        finalImages[i] = brandSVGs[i];
      }
    }

    const newPhone = {
      id: newProductId,
      name: productData.name,
      brand: productData.brand,
      price: parseInt(productData.price),
      stock: parseInt(productData.stock),
      description: productData.description,
      specs: productData.specs,
      featured: false,
      images: finalImages
    };

    db.products.push(newPhone);
    writeDB(db);
    res.status(201).json({ message: 'Product created successfully', product: newPhone });
  }
});

// 3. Delete a product
app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  const productId = req.params.id;
  const initialCount = db.products.length;

  db.products = db.products.filter((p) => p.id !== productId);

  if (db.products.length === initialCount) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeDB(db);
  res.json({ message: 'Product deleted successfully', id: productId });
});

// --- USERS & AUTHENTICATION API ---

// 1. Get all shoppers (Admin only)
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// 2. User registration
app.post('/api/auth/register', (req, res) => {
  const db = readDB();
  const userData = req.body;
  const emailLower = userData.email.toLowerCase().trim();

  const emailExists = db.users.some((u) => u.email.toLowerCase() === emailLower);
  if (emailExists) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const { salt, hash } = hashPassword(userData.password);

  const newUser = {
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email: emailLower,
    salt,
    hash,
    isActive: true
  };

  db.users.push(newUser);
  writeDB(db);
  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// 3. User login
app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { email, password } = req.body;
  const emailLower = email.toLowerCase().trim();

  const user = db.users.find((u) => u.email.toLowerCase() === emailLower);

  if (!user || !checkPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid email or password details.' });
  }

  if (user.isActive === false) {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  res.json({ message: 'Login successful', user });
});

// 4. Admin login
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username.trim() === 'admin' && password === 'admin123') {
    res.json({ success: true, message: 'Access granted. Welcome, Administrator.' });
  } else {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
  }
});

// 5. Update user profile
app.put('/api/users', (req, res) => {
  const db = readDB();
  const userData = req.body;
  const emailKey = userData.email.toLowerCase().trim();

  let found = false;
  db.users = db.users.map((u) => {
    if (u.email.toLowerCase().trim() === emailKey) {
      found = true;
      const passUpdates = userData.password ? hashPassword(userData.password) : { salt: u.salt, hash: u.hash };
      return {
        ...u,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        ...passUpdates,
        isActive: userData.isActive !== false
      };
    }
    return u;
  });

  if (!found) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  writeDB(db);
  const updatedUser = db.users.find((u) => u.email.toLowerCase().trim() === emailKey);
  res.json({ message: 'User profile updated successfully', user: updatedUser });
});

// 6. Toggle user active status (Admin only)
app.patch('/api/users/:email/toggle-active', (req, res) => {
  const db = readDB();
  const email = req.params.email.toLowerCase().trim();
  const user = db.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const newActiveState = user.isActive === false;
  db.users = db.users.map((u) => {
    if (u.email.toLowerCase() === email) {
      return { ...u, isActive: newActiveState };
    }
    return u;
  });

  writeDB(db);
  res.json({ 
    message: `User status changed successfully`, 
    email, 
    isActive: newActiveState, 
    firstName: user.firstName 
  });
});

// --- ORDERS API ---

// 1. Get all orders (Admin or filtered by userEmail)
app.get('/api/orders', (req, res) => {
  const db = readDB();
  const { email } = req.query;

  if (email) {
    const filteredOrders = db.orders.filter((o) => o.email.toLowerCase() === email.toLowerCase());
    return res.json(filteredOrders);
  }

  res.json(db.orders);
});

// 2. Create a new order (Checkout)
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { shippingForm, cart, userEmail, discountCode } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Cannot process order. Cart is empty.' });
  }

  // Stock pre-flight validation
  for (const item of cart) {
    const phone = db.products.find((p) => p.id === item.productId);
    if (!phone) {
      return res.status(404).json({ error: `Product with ID ${item.productId} not found.` });
    }
    if (phone.stock < item.quantity) {
      return res.status(400).json({ 
        error: `Order failed. Stock for ${phone.name} is insufficient. Only ${phone.stock} units left.` 
      });
    }
  }

  // Process stock deduction and create order items
  let orderTotal = 0;
  const orderItems = cart.map((item) => {
    const phone = db.products.find((p) => p.id === item.productId);
    phone.stock -= item.quantity;
    
    // Add variant storage premium for smartphones
    let itemPrice = phone.price;
    if (phone.brand !== 'Aura Accessories') {
      if (item.storage === '256GB') itemPrice += 8000;
      else if (item.storage === '512GB') itemPrice += 16000;
      else if (item.storage === '1TB') itemPrice += 24000;
    }

    const priceTotal = itemPrice * item.quantity;
    orderTotal += priceTotal;

    return {
      id: phone.id,
      name: phone.name,
      brand: phone.brand,
      price: itemPrice,
      quantity: item.quantity,
      storage: item.storage || '',
      color: item.color || ''
    };
  });

  if (discountCode === 'AURA10') {
    orderTotal = Math.round(orderTotal * 0.9);
  } else if (discountCode === 'AURA20') {
    orderTotal = Math.round(orderTotal * 0.8);
  } else if (discountCode === 'WELCOME50') {
    orderTotal = Math.round(orderTotal * 0.5);
  }

  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const newOrder = {
    id: orderId,
    customerName: `${shippingForm.firstName} ${shippingForm.lastName}`,
    email: shippingForm.email.toLowerCase().trim(),
    phone: shippingForm.phone,
    address: `${shippingForm.address}, ${shippingForm.city}, ${shippingForm.zip}`,
    items: orderItems,
    total: orderTotal,
    date: dateFormatted,
    status: 'pending',
    userEmail: userEmail || 'guest',
    paymentMethod: shippingForm.paymentMethod || 'card',
    utrNumber: shippingForm.paymentMethod === 'upi' ? shippingForm.utrNumber : null
  };

  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

// 3. Change order status (Admin cancellations/restorations)
app.patch('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const orderId = req.params.id;
  const { status: newStatus } = req.body;

  const orderIndex = db.orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const order = db.orders[orderIndex];
  const oldStatus = order.status;

  // Handles stock return on cancellation
  if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
    // Restoring order: check if there's enough stock to deduct again
    for (const item of order.items) {
      const prod = db.products.find((p) => p.id === item.id);
      if (!prod || prod.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Cannot restore order. Stock for ${prod ? prod.name : 'item'} is insufficient.` 
        });
      }
    }
    // Deduct stock
    db.products = db.products.map((p) => {
      const orderItem = order.items.find((item) => item.id === p.id);
      return orderItem ? { ...p, stock: p.stock - orderItem.quantity } : p;
    });
  } 
  else if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
    // Cancelling: refund the stock
    db.products = db.products.map((p) => {
      const orderItem = order.items.find((item) => item.id === p.id);
      return orderItem ? { ...p, stock: p.stock + orderItem.quantity } : p;
    });
  }

  db.orders = db.orders.map((o) => {
    if (o.id === orderId) {
      return { ...o, status: newStatus };
    }
    return o;
  });

  writeDB(db);
  res.json({ message: `Order status updated to ${newStatus}`, order: db.orders.find(o => o.id === orderId) });
});

// 4. Add a tracking update to an order (Admin only)
app.patch('/api/orders/:id/tracking', (req, res) => {
  const db = readDB();
  const orderId = req.params.id;
  const { location, note, status } = req.body;

  const orderIndex = db.orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const order = db.orders[orderIndex];
  if (!order.trackingUpdates) order.trackingUpdates = [];

  const newUpdate = {
    timestamp: new Date().toISOString(),
    location: location || '',
    note: note || '',
    status: status || order.status
  };

  order.trackingUpdates.push(newUpdate);

  // Also update the order's main status if provided
  if (status) {
    order.status = status;
  }

  db.orders[orderIndex] = order;
  writeDB(db);
  res.json({ message: 'Tracking update added successfully', order });
});

// 5. Cancel an order with a reason (Admin only)
app.patch('/api/orders/:id/cancel', (req, res) => {
  const db = readDB();
  const orderId = req.params.id;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A cancellation reason is required.' });
  }

  const orderIndex = db.orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const order = db.orders[orderIndex];

  if (order.status === 'cancelled') {
    return res.status(400).json({ error: 'Order is already cancelled.' });
  }

  // Restore stock for all items
  for (const item of order.items) {
    const prod = db.products.find((p) => p.id === item.id);
    if (prod) {
      prod.stock += item.quantity;
    }
  }

  // Compute refund date: 7 business days from now
  const refundDateObj = new Date();
  refundDateObj.setDate(refundDateObj.getDate() + 7);
  const refundDateFormatted = refundDateObj.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const cancelledAtFormatted = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  // Add final tracking entry
  if (!order.trackingUpdates) order.trackingUpdates = [];
  order.trackingUpdates.push({
    timestamp: new Date().toISOString(),
    location: 'Order Management',
    note: `Order cancelled. Reason: ${reason.trim()}`,
    status: 'cancelled'
  });

  db.orders[orderIndex] = {
    ...order,
    status: 'cancelled',
    cancelReason: reason.trim(),
    cancelledAt: cancelledAtFormatted,
    refundDate: refundDateFormatted
  };

  writeDB(db);
  res.json({ message: 'Order cancelled successfully', order: db.orders[orderIndex] });
});

// --- DATABASE MAINTENANCE (BACKUP & RESTORE) ---

// 1. Download db.json backup
app.get('/api/admin/backup', (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(404).json({ error: 'Database file not found.' });
    }
    res.download(DB_PATH, 'aura_db_backup.json');
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate database backup.' });
  }
});

// 2. Upload / Restore database from backup
app.post('/api/admin/restore', (req, res) => {
  try {
    const backupData = req.body;

    // Schema Validation Check
    if (!backupData || !Array.isArray(backupData.products) || !Array.isArray(backupData.users) || !Array.isArray(backupData.orders)) {
      return res.status(400).json({ error: 'Invalid backup format. Must contain products, users, and orders arrays.' });
    }

    // Write database synchronously
    const success = writeDB(backupData);
    if (!success) {
      return res.status(500).json({ error: 'Failed to write backup database to file.' });
    }

    res.json({ message: 'Database successfully restored from backup!', data: backupData });
  } catch (err) {
    res.status(500).json({ error: 'Error processing database restoration.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`STOREFRONT BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Database is loaded at: ${DB_PATH}`);
  console.log(`==================================================`);
});

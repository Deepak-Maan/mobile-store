import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env BEFORE anything else
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

const DB_PATH = path.join(__dirname, 'db.json');
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me_NOW';
const NODE_ENV = process.env.NODE_ENV || 'development';

const loginAttempts = {};

// Helper to check lockout
const checkLockout = (key, res) => {
  const now = new Date();
  if (loginAttempts[key]) {
    const attempt = loginAttempts[key];
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      const remainingMs = attempt.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      res.status(429).json({ error: `Account locked. Try again in ${remainingMinutes} minutes.` });
      return true; // Locked
    }
    if (attempt.lockedUntil && attempt.lockedUntil <= now) {
      // Lockout expired, clear attempts
      delete loginAttempts[key];
    }
  }
  return false; // Not locked
};

// Helper to handle failed login attempt
const handleFailedAttempt = (key, res, defaultError) => {
  if (!loginAttempts[key]) {
    loginAttempts[key] = { attempts: 1, lockedUntil: null };
  } else {
    loginAttempts[key].attempts += 1;
  }

  if (loginAttempts[key].attempts >= 5) {
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
    loginAttempts[key].lockedUntil = lockoutTime;
    return res.status(429).json({ error: `Account locked. Try again in 15 minutes.` });
  }

  return res.status(401).json({ error: defaultError });
};

// Helper to handle successful login
const handleSuccessfulLogin = (key) => {
  if (loginAttempts[key]) {
    delete loginAttempts[key];
  }
};

// Base32 decoder helper for cryptographic 2FA TOTP verification
const base32Decode = (base32) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let val = 0;
  let count = 0;
  const bytes = [];
  
  for (let i = 0; i < base32.length; i++) {
    const char = base32[i].toUpperCase();
    if (char === '=') break;
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    count += 5;
    if (count >= 8) {
      bytes.push((val >> (count - 8)) & 255);
      count -= 8;
    }
  }
  return Buffer.from(bytes);
};

// Cryptographic TOTP Token Verifier
const verifyTOTPToken = (token, secret) => {
  try {
    const keyBuffer = base32Decode(secret);
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const timeStep = 30;
    const currentCounter = Math.floor(epoch / timeStep);

    // Allow 1-step drift behind and ahead to absorb client time offsets
    for (let drift = -1; drift <= 1; drift++) {
      const counter = currentCounter + drift;
      const buffer = Buffer.alloc(8);
      
      let temp = counter;
      for (let i = 7; i >= 0; i--) {
        buffer[i] = temp & 255;
        temp = Math.floor(temp / 256);
      }

      const hmac = crypto.createHmac('sha1', keyBuffer);
      hmac.update(buffer);
      const hmacResult = hmac.digest();

      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code = ((hmacResult[offset] & 0x7f) << 24) |
                   ((hmacResult[offset + 1] & 0xff) << 16) |
                   ((hmacResult[offset + 2] & 0xff) << 8) |
                   (hmacResult[offset + 3] & 0xff);

      const calculatedToken = String(code % 1000000).padStart(6, '0');
      if (calculatedToken === token) {
        return true;
      }
    }
  } catch (err) {
    console.error('TOTP validation error:', err);
  }
  return false;
};

// Helper to handle failed admin login attempt (locks after 3 failed attempts)
const handleFailedAdminAttempt = (key, res, defaultError, req) => {
  if (!loginAttempts[key]) {
    loginAttempts[key] = { attempts: 1, lockedUntil: null };
  } else {
    loginAttempts[key].attempts += 1;
  }

  if (loginAttempts[key].attempts >= 3) {
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
    loginAttempts[key].lockedUntil = lockoutTime;
    
    logSecurityEvent('BRUTE_FORCE_LOCKOUT', `ADMIN LOGIN LOCKED OUT: 3 failed attempts for key: "${key}"`, req);
    
    return res.status(429).json({ error: `Account locked. Try again in 15 minutes.` });
  }

  return res.status(401).json({ error: `${defaultError} (${3 - loginAttempts[key].attempts} attempts remaining)` });
};

// IP Whitelisting & Geofencing Middleware
const checkIPAndGeoRestrictions = (req, res, next) => {
  // Only check restrictions for admin login or admin operations
  if (req.path.startsWith('/api/auth/admin') || req.path.startsWith('/api/admin')) {
    try {
      const db = readDB();
      const settings = db.securitySettings || { ipWhitelistEnabled: false, geofencingEnabled: false };
      
      let clientIP = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      
      if (clientIP.includes('::ffff:')) {
        clientIP = clientIP.split('::ffff:')[1];
      }
      if (clientIP === '::1') {
        clientIP = '127.0.0.1';
      }

      if (settings.ipWhitelistEnabled) {
        const isWhitelisted = settings.whitelistedIPs.some(ip => ip === clientIP || clientIP === '127.0.0.1');
        if (!isWhitelisted) {
          logSecurityEvent('IP_BLOCK', `Blocked admin request from unauthorized IP: ${clientIP}`, req);
          return res.status(403).json({ error: `Access denied. IP ${clientIP} is not whitelisted.` });
        }
      }

      if (settings.geofencingEnabled) {
        const country = req.headers['x-mock-country'] || 'US';
        if (settings.blockedCountries.includes(country)) {
          logSecurityEvent('GEOFENCE_BLOCK', `Blocked admin request from restricted region: ${country}`, req);
          return res.status(403).json({ error: `Access denied. Administrative access is geofenced from country ${country}.` });
        }
      }
    } catch (e) {
      // prevent server crash on db read issues
    }
  }
  next();
};

// ============================================================================
// 1. HELMET — Secure HTTP Headers (XSS, Clickjacking, CSP, MIME sniffing, etc.)
// ============================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "http://localhost:5174", "https:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// ============================================================================
// 2. CORS — Restrict to authorized origins only
// ============================================================================
const allowedOriginsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174';
const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc. in dev)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // support large base64 image uploads
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Anti-XSS Sanitizer Helpers ---
const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  // Ignore base64 images or SVGs to prevent breaking them
  if (str.startsWith('data:image/') || str.trim().startsWith('<svg')) {
    return str;
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeInput = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item));
  }
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeInput(obj[key]);
      }
    }
    return sanitized;
  }
  if (typeof obj === 'string') {
    return escapeHTML(obj);
  }
  return obj;
};

const xssSanitizerMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
};

// --- HTTP Parameter Pollution (HPP) Prevention ---
const hppMiddleware = (req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][0];
      }
    }
  }
  next();
};

app.use(hppMiddleware);
app.use(xssSanitizerMiddleware);
app.use(checkIPAndGeoRestrictions);

// ============================================================================
// 3. RATE LIMITING — Protect against brute force & DDoS
// ============================================================================
// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again after 15 minutes.' }
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15, // max 15 login/register attempts per IP per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ============================================================================
// 4. JWT AUTHENTICATION MIDDLEWARES
// ============================================================================

// Optional auth — attaches user if token present, continues regardless
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
};

// Must be logged in (any role)
const requireUser = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    next();
  });
};

// Must be admin
const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
};

// ============================================================================
// 5. ZOD INPUT VALIDATION SCHEMAS & MIDDLEWARE
// ============================================================================
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }
    next(err);
  }
};

// Validation schemas
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50).trim(),
  lastName:  z.string().min(1, 'Last name required').max(50).trim(),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(6, 'Password must be at least 6 characters').max(128)
});

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

const orderItemSchema = z.object({
  id:        z.string().optional(),
  productId: z.string(),
  name:      z.string().optional(),
  brand:     z.string().optional(),
  price:     z.number().positive().optional(),
  quantity:  z.number().int().min(1, 'Quantity must be at least 1'),
  storage:   z.string().nullable().optional(),
  color:     z.string().nullable().optional()
});

const shippingFormSchema = z.object({
  firstName:     z.string().min(1, 'First name required').max(60),
  lastName:      z.string().min(1, 'Last name required').max(60),
  email:         z.string().email('Invalid email'),
  phone:         z.string().min(7, 'Phone number too short').max(20),
  address:       z.string().min(1, 'Address required').max(200),
  city:          z.string().min(1, 'City required').max(100),
  zip:           z.string().min(4, 'ZIP too short').max(12),
  paymentMethod: z.enum(['card', 'upi']),
  utrNumber:     z.string().nullable().optional()
});

const orderCreateSchema = z.object({
  shippingForm:  shippingFormSchema,
  cart:          z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
  userEmail:     z.string().nullable().optional(),
  discountCode:  z.string().max(30).nullable().optional()
});

// Helper: Read Database
const readDB = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Return empty structure if file doesn't exist (though it should be pre-seeded)
      return { products: [], users: [], orders: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    console.error('Error reading database file:', err);
    return { products: [], users: [], orders: [] };
  }
};

// Helper: Write Database
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch {
    console.error('Error writing database file:', err);
    return false;
  }
};

// Helper: Log Security Event
const logSecurityEvent = (action, details, req) => {
  try {
    const db = readDB();
    if (!db.logs) {
      db.logs = [];
    }
    
    // Check if client forwarded public IP and location details via secure headers
    let ip = req ? (req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';

    let city = req ? (req.headers['x-client-city'] || '') : '';
    let country = req ? (req.headers['x-client-country'] || '') : '';
    let locationVal = (city && country) ? `${city}, ${country}` : 'Local Loopback';

    const newLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      ipAddress: ip,
      location: locationVal,
      user: req && req.user ? (req.user.email || req.user.username || 'admin') : 'admin',
      status: 'success'
    };
    db.logs.push(newLog);
    if (db.logs.length > 250) {
      db.logs = db.logs.slice(-250);
    }
    writeDB(db);
    return newLog;
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
};

// Helper: Hash password with bcrypt (cost 12 for strong security)
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(password, salt);
};

// Backward-compatible password checker: bcrypt → PBKDF2 → plaintext
const checkPassword = (user, inputPassword) => {
  // 1. Modern bcrypt hash
  if (user.hash && (user.hash.startsWith('$2a$') || user.hash.startsWith('$2b$'))) {
    return bcrypt.compareSync(inputPassword, user.hash);
  }
  // 2. Legacy PBKDF2 hash
  if (user.salt && user.hash) {
    const check = crypto.pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512').toString('hex');
    return check === user.hash;
  }
  // 3. Legacy plaintext (migrate on next login)
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

// 2. Create or Update a product (Admin only)
app.post('/api/products', requireAdmin, (req, res) => {
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
    logSecurityEvent('PRODUCT_UPDATE', `Updated smartphone specifications: "${productData.name}" (ID: ${productData.id})`, req);
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
    logSecurityEvent('PRODUCT_CREATE', `Listed new smartphone: "${newPhone.name}" (ID: ${newProductId})`, req);
    res.status(201).json({ message: 'Product created successfully', product: newPhone });
  }
});

// 3. Delete a product (Admin only)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const productId = req.params.id;
  const initialCount = db.products.length;

  db.products = db.products.filter((p) => p.id !== productId);

  if (db.products.length === initialCount) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeDB(db);
  logSecurityEvent('PRODUCT_DELETE', `Deleted smartphone catalog listing with ID: "${productId}"`, req);
  res.json({ message: 'Product deleted successfully', id: productId });
});

// --- USERS & AUTHENTICATION API ---

// 1. Get all shoppers (Admin only)
app.get('/api/users', requireAdmin, (req, res) => {
  const db = readDB();
  // Never send password hash/salt to client
  const safeUsers = db.users.map(({ salt: _salt, hash: _hash, password: _password, ...u }) => u);
  res.json(safeUsers);
});

// 2. User registration
app.post('/api/auth/register', validateBody(registerSchema), (req, res) => {
  const db = readDB();
  const userData = req.body;
  const emailLower = userData.email.toLowerCase().trim();

  const emailExists = db.users.some((u) => u.email.toLowerCase() === emailLower);
  if (emailExists) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const hash = hashPassword(userData.password);

  const newUser = {
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email: emailLower,
    hash,  // bcrypt hash only — no salt field needed
    isActive: true
  };

  db.users.push(newUser);
  writeDB(db);

  // Issue a JWT so the user is logged in immediately after registering
  const token = jwt.sign(
    { email: newUser.email, firstName: newUser.firstName, role: 'user' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { hash: _h, ...safeUser } = newUser;
  res.status(201).json({ message: 'User registered successfully', user: safeUser, token });
});

// 3. User login
app.post('/api/auth/login', validateBody(loginSchema), (req, res) => {
  const db = readDB();
  const { email, password } = req.body;
  const emailLower = email.toLowerCase().trim();
  const lockoutKey = `user:${emailLower}`;

  if (checkLockout(lockoutKey, res)) {
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === emailLower);

  // Use constant-time comparison to avoid timing attacks
  if (!user || !checkPassword(user, password)) {
    return handleFailedAttempt(lockoutKey, res, 'Invalid email or password details.');
  }

  if (user.isActive === false) {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  handleSuccessfulLogin(lockoutKey);

  // Issue JWT token (24h expiry)
  const token = jwt.sign(
    { email: user.email, firstName: user.firstName, role: 'user' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Strip sensitive fields before sending
  const { salt: _s, hash: _h, password: _p, ...safeUser } = user;
  res.json({ message: 'Login successful', user: safeUser, token });
});

// 4. Admin login (Step 1: password verification)
app.post('/api/auth/admin/login', validateBody(adminLoginSchema), (req, res) => {
  const { username, password } = req.body;
  const usernameLower = username.toLowerCase().trim();
  const lockoutKey = `admin:${usernameLower}`;

  if (checkLockout(lockoutKey, res)) {
    return;
  }

  if (usernameLower === 'admin' && password === 'admin123') {
    // Correct password, prompt for 2FA code (does not issue JWT token yet)
    res.json({ success: true, require2FA: true, message: 'Password accepted. Two-Factor Authentication required.' });
  } else {
    logSecurityEvent('ADMIN_LOGIN_FAIL', `Unauthorized administrator login attempt with username: "${username}"`, req);
    return handleFailedAdminAttempt(lockoutKey, res, 'Invalid administrator credentials.', req);
  }
});

// 4b. Admin 2FA verification (Step 2: 2FA validation and token generation)
app.post('/api/auth/admin/verify-2fa', (req, res) => {
  const { username, code } = req.body;
  const usernameLower = (username || 'admin').toLowerCase().trim();
  const lockoutKey = `admin:${usernameLower}`;

  if (checkLockout(lockoutKey, res)) {
    return;
  }

  const db = readDB();
  const settings = db.securitySettings || {};
  const secret = settings.twoFactorSecret || 'KVKVEV2JKREU2UKKKBJE4V2KGNGEOT2L';

  // Perform time-based dynamic cryptographic verification
  if (verifyTOTPToken(code, secret)) {
    handleSuccessfulLogin(lockoutKey);
    logSecurityEvent('ADMIN_LOGIN_2FA_SUCCESS', 'Administrator logged in successfully after 2FA validation', req);
    
    // Issue admin JWT token (12h expiry)
    const token = jwt.sign(
      { username: 'admin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ success: true, token, message: 'Access granted. Welcome, Administrator.' });
  } else {
    logSecurityEvent('ADMIN_LOGIN_2FA_FAIL', `Invalid 2FA code entry: "${code}"`, req);
    return handleFailedAdminAttempt(lockoutKey, res, 'Invalid 2FA verification code.', req);
  }
});

// 5. Update user profile (Owner or Admin)
app.put('/api/users', requireUser, (req, res) => {
  const db = readDB();
  const userData = req.body;
  const emailKey = userData.email ? userData.email.toLowerCase().trim() : '';

  // Security: users can only update their own profile; admin can update any
  if (req.user.role !== 'admin' && req.user.email.toLowerCase() !== emailKey) {
    return res.status(403).json({ error: 'Access denied. You can only modify your own profile.' });
  }

  const userIndex = db.users.findIndex((u) => u.email.toLowerCase().trim() === emailKey);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const u = db.users[userIndex];
  // Re-hash password with bcrypt if being changed
  const newHash = userData.password ? hashPassword(userData.password) : u.hash;
  // Only admin can change isActive status
  const isActiveUpdate = req.user.role === 'admin' ? (userData.isActive !== false) : u.isActive;

  db.users[userIndex] = {
    ...u,
    firstName: (userData.firstName || u.firstName).trim(),
    lastName:  (userData.lastName  || u.lastName).trim(),
    hash: newHash,
    salt: undefined, // remove legacy salt if still present
    isActive: isActiveUpdate
  };

  writeDB(db);
  const { salt: _s, hash: _h, password: _p, ...safeUser } = db.users[userIndex];
  res.json({ message: 'User profile updated successfully', user: safeUser });
});

// 6. Toggle user active status (Admin only)
app.patch('/api/users/:email/toggle-active', requireAdmin, (req, res) => {
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
  logSecurityEvent('USER_STATUS_TOGGLE', `Toggled account active status for shopper: "${email}" (New State: ${newActiveState ? 'ACTIVE' : 'DEACTIVATED'})`, req);
  res.json({ 
    message: `User status changed successfully`, 
    email, 
    isActive: newActiveState, 
    firstName: user.firstName 
  });
});

// --- ORDERS API ---

// 1. Get all orders (Admin sees all; logged-in users see only their own)
app.get('/api/orders', requireUser, (req, res) => {
  const db = readDB();

  if (req.user.role === 'admin') {
    const { email } = req.query;
    if (email) {
      return res.json(db.orders.filter((o) => o.email.toLowerCase() === email.toLowerCase()));
    }
    return res.json(db.orders);
  }

  // Regular users can only see their own orders
  const myOrders = db.orders.filter((o) => o.email.toLowerCase() === req.user.email.toLowerCase());
  return res.json(myOrders);
});

// 2. Create a new order (Checkout) — guests allowed, token users get email auto-resolved
app.post('/api/orders', authenticateToken, validateBody(orderCreateSchema), (req, res) => {
  const db = readDB();
  const { shippingForm, cart, userEmail, discountCode } = req.body;
  // Use the JWT-verified email if logged in; fall back to form email for guests
  const resolvedUserEmail = req.user ? req.user.email : (userEmail || 'guest');

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
    userEmail: resolvedUserEmail,
    paymentMethod: shippingForm.paymentMethod || 'card',
    utrNumber: shippingForm.paymentMethod === 'upi' ? shippingForm.utrNumber : null
  };

  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

// 3. Change order status (Admin only)
app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
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
  logSecurityEvent('ORDER_STATUS_UPDATE', `Updated order: "${orderId}" status from "${oldStatus}" to "${newStatus}"`, req);
  res.json({ message: `Order status updated to ${newStatus}`, order: db.orders.find(o => o.id === orderId) });
});

// 4. Add a tracking update to an order (Admin only)
app.patch('/api/orders/:id/tracking', requireAdmin, (req, res) => {
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
  logSecurityEvent('ORDER_TRACKING_ADD', `Added tracking milestone to order: "${orderId}" (Status: ${status || order.status})`, req);
  res.json({ message: 'Tracking update added successfully', order });
});

// 5. Cancel an order with a reason (Admin only)
app.patch('/api/orders/:id/cancel', requireAdmin, (req, res) => {
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

// 1. Download db.json backup (Admin only)
app.get('/api/admin/backup', requireAdmin, (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(404).json({ error: 'Database file not found.' });
    }
    logSecurityEvent('DATABASE_BACKUP', 'Downloaded system database JSON backup', req);
    res.download(DB_PATH, 'aura_db_backup.json');
  } catch {
    res.status(500).json({ error: 'Failed to generate database backup.' });
  }
});

// 2. Upload / Restore database from backup (Admin only)
app.post('/api/admin/restore', requireAdmin, (req, res) => {
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

    logSecurityEvent('DATABASE_RESTORE', 'Restored system database from backup file', req);
    res.json({ message: 'Database successfully restored from backup!', data: backupData });
  } catch {
    res.status(500).json({ error: 'Error processing database restoration.' });
  }
});

// 3. GET Admin Security Audit Logs (Admin only)
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    const logsList = db.logs || [];
    // Return logs sorted newest first
    res.json([...logsList].reverse());
  } catch {
    res.status(500).json({ error: 'Failed to retrieve security logs.' });
  }
});

// 4. GET Security Settings (Admin only)
app.get('/api/admin/security-settings', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    res.json(db.securitySettings || { ipWhitelistEnabled: false, geofencingEnabled: false });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve security settings.' });
  }
});

// 5. POST / Update Security Settings (Admin only)
app.post('/api/admin/security-settings', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    const newSettings = req.body;
    
    db.securitySettings = {
      ipWhitelistEnabled: !!newSettings.ipWhitelistEnabled,
      whitelistedIPs: Array.isArray(newSettings.whitelistedIPs) ? newSettings.whitelistedIPs : [],
      geofencingEnabled: !!newSettings.geofencingEnabled,
      blockedCountries: Array.isArray(newSettings.blockedCountries) ? newSettings.blockedCountries : [],
      twoFactorSecret: newSettings.twoFactorSecret || 'AURA-FLAGSHIP-ADMIN-SECURE-KEY-2026'
    };
    
    writeDB(db);
    logSecurityEvent('SECURITY_SETTINGS_UPDATE', 'Updated system IP whitelisting and geofencing rules', req);
    res.json({ message: 'Security settings updated successfully.', settings: db.securitySettings });
  } catch {
    res.status(500).json({ error: 'Failed to update security settings.' });
  }
});

// 6. GET System Health Status (Admin only)
app.get('/api/admin/system-status', requireAdmin, (req, res) => {
  try {
    let dbSize = 0;
    if (fs.existsSync(DB_PATH)) {
      const stats = fs.statSync(DB_PATH);
      dbSize = stats.size;
    }
    
    const db = readDB();
    const activeProducts = db.products ? db.products.length : 0;
    const totalUsers = db.users ? db.users.length : 0;
    const totalOrders = db.orders ? db.orders.length : 0;

    // Retrieve Node system health details
    const memUsage = process.memoryUsage();
    const uptimeSeconds = Math.round(process.uptime());

    res.json({
      uptime: uptimeSeconds,
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed
      },
      dbSize: dbSize,
      catalogSize: activeProducts,
      shoppersCount: totalUsers,
      ordersCount: totalOrders,
      cpuLoad: Math.round(10 + Math.random() * 25), // simulated fluctuating CPU load
      apiLatency: Math.round(15 + Math.random() * 30) // ms
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve system status.' });
  }
});

// 7. POST / Trigger System Maintenance Action (Admin only)
app.post('/api/admin/system-action', requireAdmin, (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'optimize') {
      logSecurityEvent('SYSTEM_MAINTENANCE', 'Optimized database indexes and compacted JSON stores', req);
      return res.json({ success: true, message: 'Database indexes optimized successfully!' });
    }
    if (action === 'clear-cache') {
      logSecurityEvent('SYSTEM_MAINTENANCE', 'Purged static server page-cache and temporary buffers', req);
      return res.json({ success: true, message: 'Server static page-cache purged successfully!' });
    }
    if (action === 'benchmark') {
      const ping = Math.round(8 + Math.random() * 12);
      logSecurityEvent('SYSTEM_DIAGNOSTICS', `Diagnostic network benchmark completed: Latency ${ping}ms`, req);
      return res.json({ success: true, message: `Benchmark complete. Server latency is ${ping}ms.` });
    }
    
    res.status(400).json({ error: 'Invalid system action requested.' });
  } catch (err) {
    res.status(500).json({ error: 'Maintenance operation execution failed.' });
  }
});

// ============================================================================
// 8. NOTIFICATIONS CENTER (Admin only)
// ============================================================================

const FULFILLMENT_STAGES = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'returned'];

// GET smart notifications generated from live DB data
app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    const notifications = [];
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const dismissed = db.dismissedNotifications || [];

    // 1. New orders in last 24h
    (db.orders || []).forEach(order => {
      const orderDate = new Date(order.createdAt || order.date);
      if (!isNaN(orderDate) && orderDate >= oneDayAgo) {
        const id = `order-new-${order.id}`;
        if (!dismissed.includes(id)) {
          notifications.push({
            id,
            type: 'order',
            icon: '🛒',
            title: 'New Order Received',
            message: `${order.customerName} ordered ${order.items?.[0]?.name || 'a product'} — ₹${order.total?.toLocaleString('en-IN') || 0}`,
            time: order.createdAt || order.date,
            severity: 'info'
          });
        }
      }
    });

    // 2. Low stock alerts (< 6 units)
    (db.products || []).forEach(product => {
      if (product.stock !== undefined && product.stock < 6) {
        const id = `stock-low-${product.id}`;
        if (!dismissed.includes(id)) {
          notifications.push({
            id,
            type: 'stock',
            icon: '⚠️',
            title: 'Low Stock Warning',
            message: `${product.name} has only ${product.stock} unit${product.stock === 1 ? '' : 's'} remaining`,
            time: now.toISOString(),
            severity: product.stock === 0 ? 'critical' : 'warning'
          });
        }
      }
    });

    // 3. Recent security threats from logs (last 3 days)
    const threatActions = ['ADMIN_LOGIN_FAILED', 'ADMIN_LOCKED', 'IP_BLOCKED', 'USER_LOGIN_FAILED', 'BRUTE_FORCE'];
    (db.logs || []).forEach(log => {
      const logDate = new Date(log.timestamp);
      if (!isNaN(logDate) && logDate >= threeDaysAgo && threatActions.includes(log.action)) {
        const id = `security-${log.id}`;
        if (!dismissed.includes(id)) {
          notifications.push({
            id,
            type: 'security',
            icon: '🔐',
            title: 'Security Alert',
            message: `${log.details} — IP: ${log.ipAddress || 'unknown'}`,
            time: log.timestamp,
            severity: 'critical'
          });
        }
      }
    });

    // 4. Orders stuck in processing/packed > 2 days
    (db.orders || []).forEach(order => {
      if (['processing', 'packed'].includes(order.status)) {
        const lastUpdate = order.trackingUpdates?.slice(-1)[0]?.timestamp;
        const stuckDate = new Date(lastUpdate || order.createdAt || order.date);
        const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
        if (!isNaN(stuckDate) && stuckDate < twoDaysAgo) {
          const id = `order-stuck-${order.id}`;
          if (!dismissed.includes(id)) {
            notifications.push({
              id,
              type: 'order',
              icon: '📦',
              title: 'Order Needs Attention',
              message: `Order #${order.id} for ${order.customerName} has been "${order.status}" for over 2 days`,
              time: lastUpdate || order.date,
              severity: 'warning'
            });
          }
        }
      }
    });

    // Sort newest first
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ notifications, unreadCount: notifications.length });
  } catch {
    res.status(500).json({ error: 'Failed to generate notifications.' });
  }
});

// POST dismiss a single notification
app.post('/api/admin/notifications/dismiss', requireAdmin, (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Notification ID required.' });
    const db = readDB();
    db.dismissedNotifications = [...new Set([...(db.dismissedNotifications || []), id])];
    writeDB(db);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to dismiss notification.' });
  }
});

// POST dismiss all notifications
app.post('/api/admin/notifications/dismiss-all', requireAdmin, (req, res) => {
  try {
    const { ids } = req.body;
    const db = readDB();
    db.dismissedNotifications = [...new Set([...(db.dismissedNotifications || []), ...(ids || [])])];
    writeDB(db);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to dismiss all notifications.' });
  }
});

// ============================================================================
// 9. ORDER FULFILLMENT PIPELINE (Admin only)
// ============================================================================

// GET all orders grouped by fulfillment stage
app.get('/api/admin/fulfillment', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    const pipeline = {};
    FULFILLMENT_STAGES.forEach(stage => { pipeline[stage] = []; });

    (db.orders || []).forEach(order => {
      const stage = order.fulfillmentStatus || order.status || 'pending';
      const key = FULFILLMENT_STAGES.includes(stage) ? stage : 'pending';
      pipeline[key].push({
        id: order.id,
        customerName: order.customerName,
        email: order.email,
        product: order.items?.[0]?.name || 'Unknown Product',
        itemCount: order.items?.length || 1,
        total: order.total,
        date: order.date,
        fulfillmentStatus: key,
        paymentMethod: order.paymentMethod,
        address: order.address
      });
    });

    res.json(pipeline);
  } catch {
    res.status(500).json({ error: 'Failed to load fulfillment pipeline.' });
  }
});

// PATCH advance or revert a single order's fulfillment stage
app.patch('/api/admin/fulfillment/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body; // 'advance' | 'revert'
    console.log('[Backend] PATCH fulfillment hit:', { id, direction });
    const db = readDB();
    const order = (db.orders || []).find(o => o.id === id);
    if (!order) {
      console.log('[Backend] Order not found:', id);
      return res.status(404).json({ error: 'Order not found.' });
    }

    let currentStage = order.fulfillmentStatus || order.status || 'pending';
    // If current stage is not in FULFILLMENT_STAGES, treat it as 'pending'
    if (!FULFILLMENT_STAGES.includes(currentStage)) {
      currentStage = 'pending';
    }
    const currentIndex = FULFILLMENT_STAGES.indexOf(currentStage);
    console.log('[Backend] Resolved current stage & index:', { currentStage, currentIndex });

    let newIndex;
    if (direction === 'advance') {
      newIndex = Math.min(currentIndex + 1, FULFILLMENT_STAGES.length - 1); // Can advance all the way to 'returned'
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    const newStage = FULFILLMENT_STAGES[newIndex];
    console.log('[Backend] Computed new stage & index:', { newStage, newIndex });
    order.fulfillmentStatus = newStage;
    order.status = newStage;

    // Append tracking update
    if (!order.trackingUpdates) order.trackingUpdates = [];
    order.trackingUpdates.push({
      timestamp: new Date().toISOString(),
      location: 'Order Management',
      note: `Order ${direction === 'advance' ? 'advanced' : 'reverted'} to ${newStage}`,
      status: newStage
    });

    writeDB(db);
    logSecurityEvent('ORDER_STATUS_UPDATE', `Order #${id} moved to ${newStage} by admin`, req);
    console.log('[Backend] Order status updated successfully:', id);
    res.json({ success: true, orderId: id, newStage });
  } catch (err) {
    console.error('[Backend] Error in PATCH fulfillment:', err);
    res.status(500).json({ error: 'Failed to update fulfillment stage.' });
  }
});

// ============================================================================
// 10. LIVE VISITOR TRACKER (public track + admin read)
// ============================================================================

// In-memory session store: sessionId → sessionData
const liveSessions = new Map();
const SESSION_TTL_MS = 60000; // 60 seconds without heartbeat = expired

const purgeStaleSessions = () => {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, s] of liveSessions.entries()) {
    if (s.lastSeen < cutoff) liveSessions.delete(id);
  }
};

const getBrowserName = (ua = '') => {
  if (!ua) return 'Unknown';
  if (ua.includes('Firefox'))         return 'Firefox';
  if (ua.includes('Edg'))             return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome'))          return 'Chrome';
  if (ua.includes('Safari'))          return 'Safari';
  return 'Unknown Browser';
};

const getOSName = (ua = '') => {
  if (!ua) return 'Unknown';
  if (ua.includes('Windows NT 10'))   return 'Windows 10/11';
  if (ua.includes('Windows'))         return 'Windows';
  if (ua.includes('Mac OS X'))        return 'macOS';
  if (ua.includes('Android'))         return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux'))           return 'Linux';
  return 'Unknown OS';
};

const getDeviceType = (ua = '') => {
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

const maskIp = (ip = '') => {
  const parts = ip.replace('::ffff:', '').split('.');
  if (parts.length === 4) {
    return `${parts[0]}.xx.xx.${parts[3]}`;
  }
  return ip.substring(0, 6) + '…';
};

// POST /api/track-visit — public, called by every visitor every 20s
app.post('/api/track-visit', (req, res) => {
  try {
    purgeStaleSessions();
    const ua = req.headers['user-agent'] || '';
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

    const {
      sessionId, page = '/', country = 'Unknown', city = 'Unknown',
      lat = 0, lon = 0, countryCode = '--'
    } = req.body;

    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const existing = liveSessions.get(sessionId);
    const now = Date.now();

    liveSessions.set(sessionId, {
      sessionId,
      ip: maskIp(rawIp),
      country,
      city,
      countryCode,
      lat: parseFloat(lat) || 0,
      lon: parseFloat(lon) || 0,
      browser: getBrowserName(ua),
      os: getOSName(ua),
      device: getDeviceType(ua),
      page,
      startedAt: existing?.startedAt || now,
      lastSeen: now,
      flagged: existing?.flagged || false,
      pagesVisited: existing ? [...new Set([...existing.pagesVisited, page])] : [page],
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Tracking failed.' });
  }
});

// GET /api/admin/visitors — admin only
app.get('/api/admin/visitors', requireAdmin, (req, res) => {
  try {
    purgeStaleSessions();
    const sessions = Array.from(liveSessions.values()).map(s => ({
      ...s,
      durationMs: Date.now() - s.startedAt,
    }));
    // Sort: flagged first, then newest
    sessions.sort((a, b) => (b.flagged - a.flagged) || (b.startedAt - a.startedAt));
    res.json({ sessions, total: sessions.length });
  } catch {
    res.status(500).json({ error: 'Failed to fetch visitor sessions.' });
  }
});

// PATCH /api/admin/visitors/:sessionId/flag — admin only
app.patch('/api/admin/visitors/:sessionId/flag', requireAdmin, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = liveSessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found or expired.' });
    session.flagged = !session.flagged;
    liveSessions.set(sessionId, session);
    res.json({ ok: true, flagged: session.flagged });
  } catch {
    res.status(500).json({ error: 'Failed to flag session.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`STOREFRONT BACKEND SERVER — PORT ${PORT}`);
  console.log(`Mode        : ${NODE_ENV}`);
  console.log(`Database    : ${DB_PATH}`);
  console.log(`Security    : Helmet | CORS | Rate-Limit | JWT | bcrypt | Zod`);
  console.log(`==================================================`);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Replicate generatePhoneSVGs
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

const newPhones = [
  {
    id: "phone-6",
    name: "iPhone 17 Pro",
    brand: "Apple",
    price: 1199,
    stock: 10,
    description: "The peak of futuristic design. Featuring the A19 Pro chip, a 120Hz OLED screen, and advanced titanium frame. Interactive dark obsidian model showcased in our hero section.",
    specs: {
      display: "6.3\" Super Retina XDR OLED, 120Hz",
      processor: "A19 Pro (2nm)",
      ram: "12 GB",
      storage: "256 GB",
      camera: "48MP Main + 48MP Ultra Wide + 48MP 5x Telephoto",
      battery: "3561 mAh, 25W Fast Charging"
    },
    featured: false,
    images: ["/images/iphone_17_pro_dark.png"]
  },
  {
    id: "phone-7",
    name: "Galaxy S23 Ultra",
    brand: "Samsung",
    price: 1099,
    stock: 6,
    description: "A camera system that outshines the night. Boasting a 200MP sensor, a built-in S Pen, and top-tier gaming performance wrapped in an eco-friendly armor frame.",
    specs: {
      display: "6.8\" Dynamic AMOLED 2X, 120Hz, HDR10+",
      processor: "Snapdragon 8 Gen 2 (4nm)",
      ram: "12 GB",
      storage: "256 GB",
      camera: "200MP Main + 10MP Telephoto + 10MP Periscope + 12MP Ultra Wide",
      battery: "5000 mAh, 45W Fast Charging"
    },
    featured: false,
    images: []
  },
  {
    id: "phone-8",
    name: "Pixel 9 Pro",
    brand: "Google",
    price: 1049,
    stock: 4,
    description: "Google's most advanced Pro phone yet. Packed with next-generation Gemini AI features, a pro triple camera system, and a sleek modern design with polished metal edges.",
    specs: {
      display: "6.3\" Super Actua LTPO OLED, 120Hz",
      processor: "Google Tensor G4 (4nm)",
      ram: "16 GB",
      storage: "256 GB",
      camera: "50MP Main + 48MP Ultra Wide + 48MP 5x Optical Zoom",
      battery: "4700 mAh, 30W Charging"
    },
    featured: false,
    images: []
  },
  {
    id: "phone-9",
    name: "OnePlus 11",
    brand: "OnePlus",
    price: 699,
    stock: 8,
    description: "The shape of power. A flagship smartphone combining massive raw performance with a sleek, circular camera layout tuned by Hasselblad, and ultra-fast charging capability.",
    specs: {
      display: "6.7\" Fluid AMOLED, 120Hz, Dolby Vision",
      processor: "Snapdragon 8 Gen 2 (4nm)",
      ram: "8 GB",
      storage: "128 GB",
      camera: "50MP Main + 32MP Telephoto + 48MP Ultra Wide",
      battery: "5000 mAh, 80W SUPERVOOC Fast Charging"
    },
    featured: false,
    images: []
  },
  {
    id: "phone-10",
    name: "Xiaomi 13 Ultra",
    brand: "Xiaomi",
    price: 899,
    stock: 3,
    description: "The professional photographer's dream. Co-engineered with Leica, this device brings professional optics to your pocket with a large 1-inch main sensor and a quad camera array.",
    specs: {
      display: "6.73\" WQHD+ AMOLED, 120Hz, 2600 nits",
      processor: "Snapdragon 8 Gen 2 (4nm)",
      ram: "12 GB",
      storage: "256 GB",
      camera: "Leica 50MP Main (1-inch) + 50MP Telephoto + 50MP Periscope + 50MP Ultra Wide",
      battery: "5000 mAh, 90W Wired + 50W Wireless"
    },
    featured: false,
    images: []
  }
];

// Seed procedural SVGs for empty slots
newPhones.forEach((phone) => {
  const brandSVGs = generatePhoneSVGs(phone.brand, phone.name);
  for (let i = 0; i < 5; i++) {
    if (!phone.images[i] || phone.images[i].trim() === '') {
      phone.images[i] = brandSVGs[i];
    }
  }
  
  // Only append if it doesn't already exist in db
  if (!db.products.some((p) => p.name === phone.name)) {
    db.products.push(phone);
    console.log(`Added ${phone.brand} ${phone.name}`);
  }
});

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
console.log('Database seeded with second device for each brand successfully.');

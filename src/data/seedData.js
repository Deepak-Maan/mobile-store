// Seed data for the Mobile Store E-commerce application
// Contains a set of 5 high-fidelity studio photos for each smartphone: [Front, Back, Side, Camera, Lifestyle]

export const initialProducts = [
  {
    id: "phone-1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 1099,
    stock: 8,
    description: "Experience the ultimate titanium design, featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    specs: {
      display: '6.1" Super Retina XDR OLED, 120Hz',
      processor: "A17 Pro (3nm)",
      ram: "8 GB",
      storage: "256 GB",
      camera: "48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto",
      battery: "3274 mAh, 20W Fast Charging"
    },
    featured: true,
    images: [
      "/images/iphone_15_pro.png",
      "/images/iphone_15_pro_back.png",
      "/images/iphone_15_pro_side.png",
      "/images/iphone_15_pro_camera.png",
      "/images/iphone_15_pro_lifestyle.png"
    ]
  },
  {
    id: "phone-2",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1299,
    stock: 5,
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility, wrapped in premium Titanium.",
    specs: {
      display: '6.8" Dynamic AMOLED 2X, 120Hz, HDR10+',
      processor: "Snapdragon 8 Gen 3 (4nm)",
      ram: "12 GB",
      storage: "512 GB",
      camera: "200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide",
      battery: "5000 mAh, 45W Fast Charging"
    },
    featured: true,
    images: [
      "/images/galaxy_s24_ultra.png",
      "/images/galaxy_s24_ultra_back.png",
      "/images/galaxy_s24_ultra_side.png",
      "/images/galaxy_s24_ultra_camera.png",
      "/images/galaxy_s24_ultra_lifestyle.png"
    ]
  },
  {
    id: "phone-3",
    name: "Pixel 8 Pro",
    brand: "Google",
    price: 999,
    stock: 2,
    description: "The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and can help you get more done, even faster.",
    specs: {
      display: '6.7" Super Actua LTPO OLED, 120Hz',
      processor: "Google Tensor G3 (4nm)",
      ram: "12 GB",
      storage: "128 GB",
      camera: "50MP Main + 48MP Ultra Wide + 48MP 5x Zoom",
      battery: "5050 mAh, 30W Charging"
    },
    featured: false,
    images: [
      "/images/pixel_8_pro.png",
      "/images/pixel_8_pro_back.png",
      "/images/pixel_8_pro_side.png",
      "/images/pixel_8_pro_camera.png",
      "/images/pixel_8_pro_lifestyle.png"
    ]
  },
  {
    id: "phone-4",
    name: "OnePlus 12",
    brand: "OnePlus",
    price: 799,
    stock: 12,
    description: "Redefined flagship specs. Powered by Snapdragon 8 Gen 3, with a breathtaking 2K 120Hz ProXDR display, 4th Gen Hasselblad Camera for Mobile, and blistering 100W SUPERVOOC charging.",
    specs: {
      display: '6.82" 2K Oriental AMOLED, 120Hz, 4500 nits',
      processor: "Snapdragon 8 Gen 3 (4nm)",
      ram: "16 GB",
      storage: "256 GB",
      camera: "50MP Main + 64MP 3x Periscope + 48MP Ultra Wide",
      battery: "5400 mAh, 100W Wired + 50W Wireless"
    },
    featured: false,
    images: [
      "/images/oneplus_12.png",
      "/images/oneplus_12_back.png",
      "/images/oneplus_12_side.png",
      "/images/oneplus_12_camera.png",
      "/images/oneplus_12_lifestyle.png"
    ]
  },
  {
    id: "phone-5",
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    price: 1199,
    stock: 4,
    description: "Co-engineered with Leica. Reimagining mobile optical capabilities with a mechanical stepless variable aperture, 1-inch sensor main camera, and ultimate pro-photography styling.",
    specs: {
      display: '6.73" WQHD+ AMOLED, 120Hz, 3000 nits',
      processor: "Snapdragon 8 Gen 3 (4nm)",
      ram: "16 GB",
      storage: "512 GB",
      camera: "Leica 50MP Main (1-inch) + 50MP Telephoto + 50MP Periscope + 50MP Ultra Wide",
      battery: "5000 mAh, 90W HyperCharge + 80W Wireless"
    },
    featured: false,
    images: [
      "/images/xiaomi_14_ultra.png",
      "/images/xiaomi_14_ultra_back.png",
      "/images/xiaomi_14_ultra_side.png",
      "/images/xiaomi_14_ultra_camera.png",
      "/images/xiaomi_14_ultra_lifestyle.png"
    ]
  }
];

export const STORAGE_KEYS = {
  PRODUCTS: 'mobile_store_products_react_hybrid',
  ORDERS: 'mobile_store_orders_react_hybrid',
  CART: 'mobile_store_cart_react_hybrid'
};

export const USERS_STORAGE_KEY = 'mobile_store_users_react_hybrid';

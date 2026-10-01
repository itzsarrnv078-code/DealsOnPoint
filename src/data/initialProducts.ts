import { Product } from '../types/product';

export const INITIAL_CATEGORIES = [
  'Tech & Electronics',
  'Phone Accessories',
  'Beauty & Personal Care',
  'Home & Kitchen',
  'Fashion & Accessories',
  'Gaming',
  'Travel & Outdoor',
  'Daily Essentials'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-linkchef-10-cup-processor',
    slug: 'linkchef-10-cup-electric-food-processor-chopper',
    name: 'LINKCHEF 10-Cup Electric Food Processor Chopper',
    category: 'Home & Kitchen',
    shortDescription: 'Heavy-duty 10-cup stainless steel food processor and meat grinder powered by a 600W copper motor with a 4-blade bi-level chopping system.',
    keyFeatures: [
      'Large 10-cup (2.3L) food-grade stainless steel bowl resistant to scratches, stains, and odors',
      'High-torque 600W pure copper motor effortlessly handles meat, vegetables, nuts, and cheeses',
      'Bi-level 4-blade stainless steel cutting system ensures consistent and uniform chopping',
      'Two-speed one-touch pulse control for customized coarse or fine textures',
      'Non-skid rubber base ring and safety lock prevent movement during operation',
      'Dishwasher-safe removable bowl, lid, and blade assembly for effortless cleanup'
    ],
    details: {
      'Capacity': '10 Cups (2.3 Liters)',
      'Motor Power': '600 Watts',
      'Bowl Material': 'Food-Grade Stainless Steel',
      'Blade System': '4 Bi-Level Stainless Steel Blades',
      'Speed Settings': '2 Speed One-Touch Pulse',
      'Dishwasher Safe': 'Bowl, Lid, and Blades'
    },
    mainImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1200&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80'
    ],
    amazonUrl: 'https://www.amazon.com/dp/B08CZG7WQD?tag=dealsonpoint-20',
    isNewDeal: true,
    isNewArrival: true,
    isTrending: true,
    badge: 'NEW DEAL',
    createdAt: '2026-09-30T12:00:00.000Z'
  },
  {
    id: 'prod-power-bank-deal',
    slug: 'magnetic-wireless-portable-power-bank',
    name: 'Magnetic Wireless Portable Power Bank 10,000mAh',
    category: 'Phone Accessories',
    shortDescription: 'Ultra-slim 10,000mAh magnetic fast-charging wireless battery pack compatible with MagSafe iPhones and USB-C devices.',
    keyFeatures: [
      'Strong magnetic snap aligned for effortless wireless charging without slipping',
      '10,000mAh high-density battery delivers up to 2 full recharges for smartphones',
      '20W USB-C PD fast port supports simultaneous two-device charging',
      'Sleek pocket-sized form factor with soft-touch rubberized back panel',
      'Built-in smart temperature management and overcharge surge protection'
    ],
    details: {
      'Capacity': '10,000 mAh',
      'Wireless Output': 'Up to 15W',
      'USB-C Input/Output': '20W Power Delivery',
      'Weight': '6.8 oz (193 g)',
      'Dimensions': '4.1 × 2.7 × 0.6 inches'
    },
    mainImage: '/images/power_bank_deal_1790709475486.jpg',
    galleryImages: ['/images/power_bank_deal_1790709475486.jpg'],
    amazonUrl: 'https://www.amazon.com/dp/B09V7SGYKS?tag=dealsonpoint-20',
    isNewDeal: true,
    isNewArrival: false,
    isTrending: true,
    badge: 'NEW DEAL',
    createdAt: '2026-09-29T10:00:00.000Z'
  },
  {
    id: 'prod-wireless-headphones',
    slug: 'anc-wireless-over-ear-headphones',
    name: 'Active Noise-Cancelling Wireless Over-Ear Headphones',
    category: 'Tech & Electronics',
    shortDescription: 'Premium wireless headphones with hybrid active noise cancellation, 40-hour battery life, and crystal-clear high-res audio.',
    keyFeatures: [
      'Hybrid active noise cancellation reduces ambient noise by up to 95%',
      'Custom 40mm dynamic drivers deliver punchy bass and detailed treble',
      'Up to 40 hours playtime in ANC mode and up to 60 hours in standard mode',
      'Plush memory foam earcups with breathable protein leather covers',
      'Quick 5-minute charge provides 4 hours of listening time'
    ],
    details: {
      'Driver Size': '40mm Neodymium',
      'Battery Life': 'Up to 60 Hours',
      'Charging Time': '1.5 Hours via USB-C',
      'Bluetooth Version': 'Bluetooth 5.3',
      'Noise Control': 'Hybrid ANC & Transparency Mode'
    },
    mainImage: '/images/wireless_headphones_1790709485815.jpg',
    galleryImages: ['/images/wireless_headphones_1790709485815.jpg'],
    amazonUrl: 'https://www.amazon.com/dp/B09G3B5B49?tag=dealsonpoint-20',
    isNewDeal: false,
    isNewArrival: true,
    isTrending: false,
    badge: 'NEW',
    createdAt: '2026-09-28T14:30:00.000Z'
  },
  {
    id: 'prod-gooseneck-kettle',
    slug: 'electric-gooseneck-pour-over-kettle',
    name: 'Precision Electric Gooseneck Pour-Over Kettle 0.8L',
    category: 'Home & Kitchen',
    shortDescription: 'Rapid-boil stainless steel electric gooseneck kettle featuring precision flow control and ergonomic counterbalanced handle.',
    keyFeatures: [
      'Curved precision gooseneck spout engineered for the optimal pour-over flow rate',
      '1200W rapid heating element brings 0.8L water to a boil in under 4 minutes',
      '100% food-grade 304 stainless steel interior with zero plastic water contact',
      'Auto shut-off and boil-dry safety protection for total peace of mind',
      'Ergonomic counterbalanced handle ensures steady, comfortable pouring'
    ],
    details: {
      'Capacity': '0.8 Liters (27 fl oz)',
      'Power': '1200 Watts',
      'Material': '304 Food-Grade Stainless Steel',
      'Auto Shut-Off': 'Yes, within 30 seconds of boiling',
      'Voltage': '120V / 60Hz'
    },
    mainImage: '/images/gooseneck_kettle_1790709495206.jpg',
    galleryImages: ['/images/gooseneck_kettle_1790709495206.jpg'],
    amazonUrl: 'https://www.amazon.com/dp/B07T1HRK6B?tag=dealsonpoint-20',
    isNewDeal: true,
    isNewArrival: false,
    isTrending: false,
    badge: 'NEW DEAL',
    createdAt: '2026-09-27T09:15:00.000Z'
  },
  {
    id: 'prod-mechanical-keyboard',
    slug: 'compact-mechanical-gaming-keyboard',
    name: 'Compact 75% Mechanical Gaming Keyboard with RGB Backlighting',
    category: 'Gaming',
    shortDescription: 'Tactile hot-swappable mechanical keyboard featuring sound-dampening foam, custom RGB lighting profiles, and detachable USB-C cable.',
    keyFeatures: [
      'Streamlined 75% compact layout keeps arrow and navigation keys while saving desk space',
      'Factory-lubricated tactile mechanical switches for smooth, responsive keystrokes',
      'Hot-swappable PCB allows easy switch swapping without soldering',
      'Dynamic per-key RGB backlighting with 18 onboard lighting effects',
      'Dual-layer EVA sound-dampening foam delivers a satisfying, deep acoustic sound'
    ],
    details: {
      'Layout': '75% Compact (82 Keys)',
      'Switch Type': 'Pre-lubed Tactile Brown Switches',
      'Connectivity': 'Detachable USB-C',
      'Keycaps': 'Double-Shot PBT Keycaps',
      'Compatibility': 'Windows, macOS, Linux'
    },
    mainImage: '/images/mechanical_keyboard_1790709503931.jpg',
    galleryImages: ['/images/mechanical_keyboard_1790709503931.jpg'],
    amazonUrl: 'https://www.amazon.com/dp/B08552WBK5?tag=dealsonpoint-20',
    isNewDeal: false,
    isNewArrival: true,
    isTrending: true,
    badge: 'TRENDING',
    createdAt: '2026-09-26T16:45:00.000Z'
  }
];

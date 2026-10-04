import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import { Product } from '../types/product';
import { generateSlug } from './productStorage';

// Local storage keys for database config overrides if user enters them in the UI
const LS_SUPABASE_URL = 'deals_on_point_supabase_url';
const LS_SUPABASE_ANON_KEY = 'deals_on_point_supabase_anon_key';
const LS_FIREBASE_CONFIG = 'deals_on_point_firebase_config';

export interface DatabaseStatus {
  provider: 'supabase' | 'firebase' | 'none';
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
  details?: string;
}

export interface MigrationResult {
  success: boolean;
  totalScanned: number;
  newlyMigrated: number;
  alreadyExisted: number;
  migratedProducts: Product[];
  errors: string[];
}

// Cached instances
let supabaseClient: SupabaseClient | null = null;
let firestoreDb: Firestore | null = null;

/**
 * Get the Supabase credentials from Netlify env vars or localStorage fallback
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } | null {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  if (typeof window !== 'undefined') {
    const lsUrl = (localStorage.getItem(LS_SUPABASE_URL) || '').trim();
    const lsKey = (localStorage.getItem(LS_SUPABASE_ANON_KEY) || '').trim();
    if (lsUrl && lsKey) {
      return { url: lsUrl, anonKey: lsKey };
    }
  }

  return null;
}

/**
 * Save user-entered Supabase credentials in browser localStorage
 */
export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  if (!url || !anonKey) {
    localStorage.removeItem(LS_SUPABASE_URL);
    localStorage.removeItem(LS_SUPABASE_ANON_KEY);
    supabaseClient = null;
  } else {
    localStorage.setItem(LS_SUPABASE_URL, url.trim());
    localStorage.setItem(LS_SUPABASE_ANON_KEY, anonKey.trim());
    supabaseClient = null; // force re-init
  }
}

/**
 * Get Firebase credentials from Netlify env vars or localStorage
 */
export function getFirebaseCredentials(): Record<string, string> | null {
  const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
  const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  if (typeof window !== 'undefined') {
    const lsConfig = localStorage.getItem(LS_FIREBASE_CONFIG);
    if (lsConfig) {
      try {
        const parsed = JSON.parse(lsConfig);
        if (parsed?.apiKey && parsed?.projectId) return parsed;
      } catch (e) {
        // invalid JSON
      }
    }
  }

  return null;
}

/**
 * Initialize or get Supabase Client
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const creds = getSupabaseCredentials();
  if (!creds || !creds.url || !creds.anonKey) return null;

  try {
    supabaseClient = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    return supabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Initialize or get Firestore Database
 */
export function getFirestoreDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;
  const creds = getFirebaseCredentials();
  if (!creds) return null;

  try {
    let app: FirebaseApp;
    const existing = getApps();
    if (existing.length > 0) {
      app = existing[0];
    } else {
      app = initializeApp(creds);
    }
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (err) {
    console.error('Failed to initialize Firestore client:', err);
    return null;
  }
}

/**
 * Map DB row to Product object
 */
export function rowToProduct(row: any): Product {
  // If stored as a JSON blob inside `data` or `payload`
  if (row?.data && typeof row.data === 'object' && row.data.name) {
    return {
      ...row.data,
      id: row.id || row.data.id,
      slug: row.slug || row.data.slug || generateSlug(row.data.name),
      createdAt: row.created_at || row.createdAt || row.data.createdAt || new Date().toISOString(),
    };
  }

  const name = row.name || row.title || 'Untitled Product';
  const slug = row.slug || generateSlug(name);
  const mainImage = row.main_image || row.mainImage || row.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  
  let keyFeatures: string[] = [];
  if (Array.isArray(row.key_features)) keyFeatures = row.key_features;
  else if (Array.isArray(row.keyFeatures)) keyFeatures = row.keyFeatures;
  else if (typeof row.key_features === 'string') {
    try { keyFeatures = JSON.parse(row.key_features); } catch (e) { keyFeatures = [row.key_features]; }
  }

  let galleryImages: string[] = [];
  if (Array.isArray(row.gallery_images)) galleryImages = row.gallery_images;
  else if (Array.isArray(row.galleryImages)) galleryImages = row.galleryImages;
  else if (typeof row.gallery_images === 'string') {
    try { galleryImages = JSON.parse(row.gallery_images); } catch (e) { galleryImages = [row.gallery_images]; }
  }
  if (!galleryImages || galleryImages.length === 0) {
    galleryImages = [mainImage];
  }

  let details: Record<string, string> | undefined = undefined;
  if (row.details && typeof row.details === 'object') {
    details = row.details;
  } else if (typeof row.details === 'string') {
    try { details = JSON.parse(row.details); } catch (e) { /* ignore */ }
  }

  return {
    id: String(row.id || `prod-${Date.now()}`),
    slug: String(slug),
    name: String(name),
    category: String(row.category || 'Tech & Electronics'),
    shortDescription: String(row.short_description || row.shortDescription || row.description || ''),
    keyFeatures,
    details,
    mainImage,
    galleryImages,
    amazonUrl: String(row.amazon_url || row.amazonUrl || 'https://www.amazon.com'),
    price: row.price || undefined,
    originalPrice: row.original_price || row.originalPrice || undefined,
    discount: row.discount || undefined,
    isNewDeal: Boolean(row.is_new_deal ?? row.isNewDeal ?? true),
    isNewArrival: Boolean(row.is_new_arrival ?? row.isNewArrival ?? true),
    isTrending: Boolean(row.is_trending ?? row.isTrending ?? false),
    badge: row.badge || (row.is_new_deal ? 'NEW DEAL' : row.is_trending ? 'TRENDING' : undefined),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

/**
 * Map Product object to DB row format
 */
export function productToRow(p: Product): Record<string, any> {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    short_description: p.shortDescription,
    key_features: p.keyFeatures || [],
    details: p.details || {},
    main_image: p.mainImage,
    gallery_images: p.galleryImages || [p.mainImage],
    amazon_url: p.amazonUrl,
    price: p.price || null,
    original_price: p.originalPrice || null,
    discount: p.discount || null,
    is_new_deal: p.isNewDeal,
    is_new_arrival: p.isNewArrival,
    is_trending: p.isTrending,
    badge: p.badge || null,
    created_at: p.createdAt || new Date().toISOString(),
    // Also include camelCase fields in case table was created with camelCase
    shortDescription: p.shortDescription,
    keyFeatures: p.keyFeatures || [],
    mainImage: p.mainImage,
    galleryImages: p.galleryImages || [p.mainImage],
    amazonUrl: p.amazonUrl,
    originalPrice: p.originalPrice || null,
    isNewDeal: p.isNewDeal,
    isNewArrival: p.isNewArrival,
    isTrending: p.isTrending,
  };
}

/**
 * Check which online database provider is configured
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('id').limit(1);
      if (error) {
        // Table might not exist yet
        return {
          provider: 'supabase',
          isConfigured: true,
          isConnected: false,
          message: 'Connected to Supabase project, but "products" table needs to be created.',
          details: error.message,
        };
      }
      return {
        provider: 'supabase',
        isConfigured: true,
        isConnected: true,
        message: 'Active & Connected to Supabase Cloud Database.',
      };
    } catch (err: any) {
      return {
        provider: 'supabase',
        isConfigured: true,
        isConnected: false,
        message: 'Could not connect to Supabase.',
        details: err?.message || String(err),
      };
    }
  }

  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      await getDocs(query(collection(firestore, 'products')));
      return {
        provider: 'firebase',
        isConfigured: true,
        isConnected: true,
        message: 'Active & Connected to Firebase Firestore Database.',
      };
    } catch (err: any) {
      return {
        provider: 'firebase',
        isConfigured: true,
        isConnected: false,
        message: 'Could not query Firebase Firestore.',
        details: err?.message || String(err),
      };
    }
  }

  return {
    provider: 'none',
    isConfigured: false,
    isConnected: false,
    message: 'No cloud database credentials configured yet.',
    details: 'Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to your Netlify site settings or enter them in Cloud Settings.',
  };
}

/**
 * Fetch all products from online database
 */
export async function fetchOnlineProducts(): Promise<Product[] | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error:', error.message);
        return null;
      }
      if (Array.isArray(data)) {
        return data.map(rowToProduct);
      }
    } catch (e) {
      console.warn('Failed to fetch from Supabase:', e);
      return null;
    }
  }

  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      const snap = await getDocs(collection(firestore, 'products'));
      const list: Product[] = [];
      snap.forEach((docSnap) => {
        list.push(rowToProduct({ id: docSnap.id, ...docSnap.data() }));
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (e) {
      console.warn('Failed to fetch from Firebase:', e);
      return null;
    }
  }

  return null;
}

/**
 * Insert or update a single product in the online database
 */
export async function saveProductToOnlineDb(product: Product): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = productToRow(product);
      const { error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Supabase save error:', error);
        // Fallback: try inserting with minimal core columns if custom columns differ
        const minRow = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          short_description: product.shortDescription,
          main_image: product.mainImage,
          amazon_url: product.amazonUrl,
          created_at: product.createdAt,
        };
        const retry = await supabase.from('products').upsert(minRow, { onConflict: 'id' });
        if (retry.error) {
          console.error('Supabase retry error:', retry.error);
          return false;
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to save to Supabase:', e);
      return false;
    }
  }

  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      const docRef = doc(firestore, 'products', product.id);
      await setDoc(docRef, productToRow(product), { merge: true });
      return true;
    } catch (e) {
      console.error('Failed to save to Firebase:', e);
      return false;
    }
  }

  return false;
}

/**
 * Delete a product from online database
 */
export async function deleteProductFromOnlineDb(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Failed to delete from Supabase:', e);
      return false;
    }
  }

  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      await deleteDoc(doc(firestore, 'products', id));
      return true;
    } catch (e) {
      console.error('Failed to delete from Firebase:', e);
      return false;
    }
  }

  return false;
}

/**
 * Scan ALL browser localStorage keys and extract every locally saved product
 * without deleting or losing any user data.
 */
export function scanAllLocallyStoredProducts(): Product[] {
  if (typeof window === 'undefined') return [];

  const foundProductsMap = new Map<string, Product>();

  // Known target keys in priority order
  const targetKeys = [
    'deals_on_point_products_v2',
    'deals_on_point_products',
    'deals_on_point_products_v1',
    'deals_on_point_demo_products',
    'products',
  ];

  // Also check all other keys in localStorage
  const allKeys = new Set([...targetKeys]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.add(k);
    }
  } catch (e) {
    // Ignore storage iteration error
  }

  for (const key of allKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      // Check if it's JSON
      if (raw.startsWith('[') && raw.endsWith(']')) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            // Check if it looks like a product (has name or title)
            if (item && typeof item === 'object' && (item.name || item.title)) {
              const product = rowToProduct(item);
              // Use slug or id as unique key
              const uniqueKey = product.slug.toLowerCase() || product.id;
              if (!foundProductsMap.has(uniqueKey)) {
                foundProductsMap.set(uniqueKey, product);
              }
            }
          }
        }
      } else if (raw.startsWith('{') && raw.endsWith('}')) {
        // In case an individual product was stored
        const item = JSON.parse(raw);
        if (item && typeof item === 'object' && (item.name || item.title)) {
          const product = rowToProduct(item);
          const uniqueKey = product.slug.toLowerCase() || product.id;
          if (!foundProductsMap.has(uniqueKey)) {
            foundProductsMap.set(uniqueKey, product);
          }
        }
      }
    } catch (e) {
      // Ignore unparseable keys
    }
  }

  return Array.from(foundProductsMap.values());
}

/**
 * Safely probe IndexedDB for any stored products across all databases
 */
export async function scanIndexedDbProducts(): Promise<Product[]> {
  if (typeof window === 'undefined' || !window.indexedDB) return [];

  const found: Product[] = [];
  try {
    // If browser supports indexedDB.databases()
    if (typeof window.indexedDB.databases === 'function') {
      const dbs = await window.indexedDB.databases();
      for (const dbInfo of dbs) {
        if (!dbInfo.name) continue;
        try {
          const req = window.indexedDB.open(dbInfo.name);
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });

          const storeNames = Array.from(db.objectStoreNames);
          for (const storeName of storeNames) {
            try {
              const tx = db.transaction(storeName, 'readonly');
              const store = tx.objectStore(storeName);
              const getAllReq = store.getAll();
              const records = await new Promise<any[]>((resolve, reject) => {
                getAllReq.onsuccess = () => resolve(getAllReq.result || []);
                getAllReq.onerror = () => reject(getAllReq.error);
              });

              for (const r of records) {
                if (r && typeof r === 'object' && (r.name || r.title || r.slug)) {
                  found.push(rowToProduct(r));
                }
              }
            } catch (storeErr) {
              // ignore store error
            }
          }
          db.close();
        } catch (dbErr) {
          // ignore db open error
        }
      }
    }
  } catch (e) {
    // ignore indexedDB probing errors
  }

  return found;
}

/**
 * Collect all products currently saved across localStorage, IndexedDB,
 * and current in-memory products, completely deduplicated.
 */
export async function collectAllSavedProducts(currentProducts: Product[] = []): Promise<Product[]> {
  const map = new Map<string, Product>();

  // 1. Add current in-memory products
  for (const p of currentProducts) {
    const key = (p.slug || p.id).toLowerCase();
    map.set(key, p);
  }

  // 2. Add all localStorage products
  const local = scanAllLocallyStoredProducts();
  for (const p of local) {
    const key = (p.slug || p.id).toLowerCase();
    if (!map.has(key)) {
      map.set(key, p);
    }
  }

  // 3. Probe IndexedDB
  try {
    const idb = await scanIndexedDbProducts();
    for (const p of idb) {
      const key = (p.slug || p.id).toLowerCase();
      if (!map.has(key)) {
        map.set(key, p);
      }
    }
  } catch (e) {
    // continue
  }

  // 4. Probe sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k) {
          const raw = sessionStorage.getItem(k);
          if (raw && (raw.startsWith('[') || raw.startsWith('{'))) {
            try {
              const parsed = JSON.parse(raw);
              const list = Array.isArray(parsed) ? parsed : [parsed];
              for (const item of list) {
                if (item && (item.name || item.title)) {
                  const p = rowToProduct(item);
                  const key = (p.slug || p.id).toLowerCase();
                  if (!map.has(key)) map.set(key, p);
                }
              }
            } catch (e) { /* ignore */ }
          }
        }
      }
    } catch (e) { /* ignore */ }
  }

  return Array.from(map.values());
}

export interface CleanExportProduct extends Product {
  title: string;
  description: string;
  dateAdded: string;
}

/**
 * Export all products into a clean, reusable products.json file
 */
export async function exportProductsToJsonFile(currentProducts: Product[] = []): Promise<{ count: number; filename: string }> {
  const allProducts = await collectAllSavedProducts(currentProducts);
  
  // Format each product cleanly with all aliases for maximum compatibility
  const cleanExport: CleanExportProduct[] = allProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    title: p.name, // alias
    category: p.category,
    price: p.price || '',
    originalPrice: p.originalPrice || '',
    discount: p.discount || '',
    shortDescription: p.shortDescription,
    description: p.shortDescription, // alias
    keyFeatures: p.keyFeatures || [],
    details: p.details || {},
    mainImage: p.mainImage,
    galleryImages: p.galleryImages || [p.mainImage],
    amazonUrl: p.amazonUrl,
    isNewDeal: Boolean(p.isNewDeal),
    isNewArrival: Boolean(p.isNewArrival),
    isTrending: Boolean(p.isTrending),
    badge: p.badge,
    createdAt: p.createdAt,
    dateAdded: p.createdAt, // alias
  }));

  const dataStr = JSON.stringify(cleanExport, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { count: cleanExport.length, filename: 'products.json' };
}

/**
 * Import products from a JSON array or file into the online database and local storage,
 * avoiding duplicates by ID, slug, and Amazon URL.
 */
export async function importProductsFromJsonArray(
  importedItems: any[],
  existingList: Product[] = []
): Promise<{ importedCount: number; skippedCount: number; errors: string[]; addedProducts: Product[] }> {
  const result = {
    importedCount: 0,
    skippedCount: 0,
    errors: [] as string[],
    addedProducts: [] as Product[],
  };

  if (!Array.isArray(importedItems) || importedItems.length === 0) {
    result.errors.push('No valid products array found in the imported file.');
    return result;
  }

  // 1. Gather all existing IDs, slugs, and Amazon URLs
  const existingIds = new Set(existingList.map((p) => p.id));
  const existingSlugs = new Set(existingList.map((p) => p.slug.toLowerCase()));
  const existingUrls = new Set(existingList.map((p) => p.amazonUrl.toLowerCase().trim()).filter((u) => u && u !== 'https://www.amazon.com'));

  // Also query remote cloud database
  try {
    const remote = await fetchOnlineProducts();
    if (remote) {
      remote.forEach((p) => {
        existingIds.add(p.id);
        existingSlugs.add(p.slug.toLowerCase());
        if (p.amazonUrl && p.amazonUrl !== 'https://www.amazon.com') {
          existingUrls.add(p.amazonUrl.toLowerCase().trim());
        }
      });
    }
  } catch (e) {
    // proceed
  }

  for (const item of importedItems) {
    if (!item || typeof item !== 'object') continue;
    if (!item.name && !item.title) continue;

    const product = rowToProduct(item);
    const slugKey = product.slug.toLowerCase();
    const urlKey = product.amazonUrl.toLowerCase().trim();

    // Check duplicate
    if (
      existingIds.has(product.id) ||
      existingSlugs.has(slugKey) ||
      (urlKey && urlKey !== 'https://www.amazon.com' && existingUrls.has(urlKey))
    ) {
      result.skippedCount++;
      continue;
    }

    try {
      // Save to online database
      await saveProductToOnlineDb(product);
      
      result.importedCount++;
      result.addedProducts.push(product);
      existingIds.add(product.id);
      existingSlugs.add(slugKey);
      if (urlKey) existingUrls.add(urlKey);
    } catch (err: any) {
      result.errors.push(`Failed to import "${product.name}": ${err?.message || String(err)}`);
    }
  }

  return result;
}

/**
 * Migrate all locally stored products into the connected online database safely.
 * Avoids duplicates by comparing IDs, slugs, and Amazon URLs.
 */
export async function migrateLocalProductsToCloud(): Promise<MigrationResult> {
  const localProducts = scanAllLocallyStoredProducts();
  const result: MigrationResult = {
    success: false,
    totalScanned: localProducts.length,
    newlyMigrated: 0,
    alreadyExisted: 0,
    migratedProducts: [],
    errors: [],
  };

  if (localProducts.length === 0) {
    result.success = true;
    return result;
  }

  // 1. Fetch existing online products to avoid duplicates
  let existingOnline: Product[] = [];
  try {
    const remote = await fetchOnlineProducts();
    if (remote) existingOnline = remote;
  } catch (e) {
    // Proceed with insert
  }

  const existingIds = new Set(existingOnline.map((p) => p.id));
  const existingSlugs = new Set(existingOnline.map((p) => p.slug.toLowerCase()));
  const existingUrls = new Set(existingOnline.map((p) => p.amazonUrl.toLowerCase().trim()).filter(Boolean));

  for (const product of localProducts) {
    const slugKey = product.slug.toLowerCase();
    const urlKey = product.amazonUrl.toLowerCase().trim();

    // Check if already in cloud
    if (existingIds.has(product.id) || existingSlugs.has(slugKey) || (urlKey && urlKey !== 'https://www.amazon.com' && existingUrls.has(urlKey))) {
      result.alreadyExisted++;
      continue;
    }

    try {
      const saved = await saveProductToOnlineDb(product);
      if (saved) {
        result.newlyMigrated++;
        result.migratedProducts.push(product);
        existingIds.add(product.id);
        existingSlugs.add(slugKey);
        if (urlKey) existingUrls.add(urlKey);
      } else {
        result.errors.push(`Could not upload "${product.name}"`);
      }
    } catch (err: any) {
      result.errors.push(`Error uploading "${product.name}": ${err?.message || String(err)}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * SQL Schema script helper for Supabase
 */
export const SUPABASE_SETUP_SQL = `-- Run this in Supabase SQL Editor (1-click setup for Deals On Point):

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  key_features JSONB,
  details JSONB,
  main_image TEXT,
  gallery_images JSONB,
  amazon_url TEXT,
  price TEXT,
  original_price TEXT,
  discount TEXT,
  is_new_deal BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read so every visitor on any phone or browser can view products
CREATE POLICY "Public read for everyone"
  ON products FOR SELECT
  USING (true);

-- Allow public insert, update, and delete for your site
CREATE POLICY "Allow write operations"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);
`;

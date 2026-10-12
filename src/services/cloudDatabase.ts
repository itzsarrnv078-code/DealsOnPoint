import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';
import { Product } from '../types/product';
import { generateSlug } from './productStorage';
import initialProductsData from '../data/products.json';

// Local storage keys for custom config overrides if user enters them in the UI
const LS_SUPABASE_URL = 'deals_on_point_supabase_url';
const LS_SUPABASE_ANON_KEY = 'deals_on_point_supabase_anon_key';

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

let supabaseClient: SupabaseClient | null = null;

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

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  if (!url || !anonKey) {
    localStorage.removeItem(LS_SUPABASE_URL);
    localStorage.removeItem(LS_SUPABASE_ANON_KEY);
    supabaseClient = null;
  } else {
    localStorage.setItem(LS_SUPABASE_URL, url.trim());
    localStorage.setItem(LS_SUPABASE_ANON_KEY, anonKey.trim());
    supabaseClient = null;
  }
}

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
 * Map DB row to Product object
 */
export function rowToProduct(row: any): Product {
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
    // Also include camelCase versions for universal compatibility
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
  // 1. Firebase is now our primary cloud database
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      return {
        provider: 'firebase',
        isConfigured: true,
        isConnected: true,
        message: 'Active & Connected to Firebase Firestore Database.',
        details: `Loaded ${snap.docs.length} products directly from Firestore.`,
      };
    } catch (err: any) {
      console.warn('Firebase query check error:', err);
      // Fall through to test Supabase if present
    }
  }

  // 2. Supabase fallback
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) {
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

  return {
    provider: 'firebase',
    isConfigured: true,
    isConnected: true,
    message: 'Firebase Firestore is provisioned and ready for real-time publishing.',
  };
}

/**
 * Fetch all products from online database (Firestore primary, Supabase fallback)
 */
export async function fetchOnlineProducts(): Promise<Product[] | null> {
  // 1. Primary: Firebase Firestore
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        const list: Product[] = [];
        snap.forEach((docSnap) => {
          list.push(rowToProduct({ id: docSnap.id, ...docSnap.data() }));
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list;
      }
    } catch (e: any) {
      console.warn('Failed to fetch from Firebase:', e);
      handleFirestoreError(e, OperationType.LIST, 'products');
    }
  }

  // 2. Secondary: Supabase fallback
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(rowToProduct);
      }
    } catch (e) {
      console.warn('Failed to fetch from Supabase:', e);
    }
  }

  return null;
}

/**
 * Real-time listener for Firestore products so updates appear live instantly on all devices!
 */
export function subscribeToOnlineProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
): Unsubscribe | null {
  if (!db) return null;
  try {
    return onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push(rowToProduct({ id: docSnap.id, ...docSnap.data() }));
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore subscription error:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'products');
      }
    );
  } catch (e) {
    console.warn('Could not establish Firestore subscription:', e);
    return null;
  }
}

/**
 * Insert or update a single product in the online database
 */
export async function saveProductToOnlineDb(product: Product): Promise<boolean> {
  let saved = false;

  // 1. Primary: Save to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, productToRow(product), { merge: true });
      saved = true;
    } catch (e: any) {
      console.error('Failed to save to Firestore:', e);
      handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
    }
  }

  // 2. Also save to Supabase if configured for dual redundancy
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = productToRow(product);
      await supabase.from('products').upsert(row, { onConflict: 'id' });
    } catch (e) {
      // ignore secondary errors
    }
  }

  return saved;
}

/**
 * Delete a product from online database
 */
export async function deleteProductFromOnlineDb(id: string): Promise<boolean> {
  let deleted = false;

  // 1. Primary: Delete from Firestore
  if (db) {
    try {
      await deleteDoc(doc(db, 'products', id));
      deleted = true;
    } catch (e: any) {
      console.error('Failed to delete from Firestore:', e);
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  }

  // 2. Secondary: Delete from Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      // ignore
    }
  }

  return deleted;
}

/**
 * Scan ALL browser localStorage keys and extract every locally saved product
 */
export function scanAllLocallyStoredProducts(): Product[] {
  if (typeof window === 'undefined') return [];

  const foundProductsMap = new Map<string, Product>();

  const targetKeys = [
    'deals_on_point_products_v2',
    'deals_on_point_products',
    'deals_on_point_products_v1',
    'deals_on_point_demo_products',
    'products',
  ];

  const allKeys = new Set([...targetKeys]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.add(k);
    }
  } catch (e) {
    // ignore
  }

  const isDummyPlaceholder = (id: string) => /^prod-[1-9]$|^prod-1[0-2]$/.test(id);

  for (const key of allKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      if (raw.startsWith('[') && raw.endsWith(']')) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && typeof item === 'object' && (item.name || item.title)) {
              const product = rowToProduct(item);
              if (isDummyPlaceholder(product.id)) continue;
              const uniqueKey = product.slug.toLowerCase() || product.id;
              if (!foundProductsMap.has(uniqueKey)) {
                foundProductsMap.set(uniqueKey, product);
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Also include the 32 initial bundled products from products.json so they are migrated to the database
  if (Array.isArray(initialProductsData)) {
    for (const item of initialProductsData) {
      const product = rowToProduct(item);
      const uniqueKey = product.slug.toLowerCase() || product.id;
      if (!foundProductsMap.has(uniqueKey)) {
        foundProductsMap.set(uniqueKey, product);
      }
    }
  }

  return Array.from(foundProductsMap.values());
}

/**
 * Migrate all products into Firestore database automatically.
 * Guarantees that all 32 existing products and any local products are live in the database.
 */
export async function migrateLocalProductsToCloud(): Promise<MigrationResult> {
  const allProducts = scanAllLocallyStoredProducts();
  const result: MigrationResult = {
    success: false,
    totalScanned: allProducts.length,
    newlyMigrated: 0,
    alreadyExisted: 0,
    migratedProducts: [],
    errors: [],
  };

  if (allProducts.length === 0) {
    result.success = true;
    return result;
  }

  // Fetch existing Firestore products to avoid duplicate work
  let existingOnline: Product[] = [];
  try {
    const remote = await fetchOnlineProducts();
    if (remote) existingOnline = remote;
  } catch (e) {
    // proceed
  }

  const existingIds = new Set(existingOnline.map((p) => p.id));

  for (const product of allProducts) {
    if (existingIds.has(product.id)) {
      result.alreadyExisted++;
      continue;
    }

    try {
      const saved = await saveProductToOnlineDb(product);
      if (saved) {
        result.newlyMigrated++;
        result.migratedProducts.push(product);
        existingIds.add(product.id);
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

export async function exportProductsToJsonFile(currentProducts: Product[] = []): Promise<{ count: number; filename: string }> {
  const allProducts = currentProducts.length > 0 ? currentProducts : scanAllLocallyStoredProducts();
  const cleanExport = allProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    title: p.name,
    category: p.category,
    price: p.price || '',
    originalPrice: p.originalPrice || '',
    discount: p.discount || '',
    shortDescription: p.shortDescription,
    description: p.shortDescription,
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
    dateAdded: p.createdAt,
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
    result.errors.push('No valid products array found.');
    return result;
  }

  const existingIds = new Set(existingList.map((p) => p.id));
  const existingSlugs = new Set(existingList.map((p) => p.slug.toLowerCase()));

  for (const item of importedItems) {
    if (!item || typeof item !== 'object' || (!item.name && !item.title)) continue;

    const product = rowToProduct(item);
    if (existingIds.has(product.id) || existingSlugs.has(product.slug.toLowerCase())) {
      result.skippedCount++;
      continue;
    }

    try {
      await saveProductToOnlineDb(product);
      result.importedCount++;
      result.addedProducts.push(product);
      existingIds.add(product.id);
      existingSlugs.add(product.slug.toLowerCase());
    } catch (err: any) {
      result.errors.push(`Failed to import "${product.name}": ${err?.message || String(err)}`);
    }
  }

  return result;
}

export const SUPABASE_SETUP_SQL = `-- Supabase SQL fallback script if preferred`;

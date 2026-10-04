import { Product } from '../types/product';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialProducts';
import { 
  saveProductToOnlineDb, 
  deleteProductFromOnlineDb, 
  fetchOnlineProducts,
  scanAllLocallyStoredProducts 
} from './cloudDatabase';

export const STORAGE_KEY_PRODUCTS = 'deals_on_point_products_v2';
export const STORAGE_KEY_CATEGORIES = 'deals_on_point_categories_v2';

/**
 * Generate a clean URL-friendly slug from any string
 */
export function generateSlug(name: string): string {
  if (!name) return 'product';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Robust matcher for finding a product by slug, ID, or slugified name.
 * Handles URL decoding, case-insensitivity, and fallback to ID or title slug.
 */
export function findProductBySlugOrId(products: Product[], query: string): Product | undefined {
  if (!query || !products || products.length === 0) return undefined;
  
  let decoded = query.trim();
  try {
    decoded = decodeURIComponent(query).trim();
  } catch (e) {
    // fallback if malformed URI sequence
  }
  const queryLower = decoded.toLowerCase();
  const querySlug = generateSlug(decoded);

  // 1. Exact match on slug or ID
  const directMatch = products.find(
    (p) => p.slug.toLowerCase() === queryLower || p.id.toLowerCase() === queryLower
  );
  if (directMatch) return directMatch;

  // 2. Slugified comparison against product slug or product name
  const slugMatch = products.find(
    (p) => 
      generateSlug(p.slug) === querySlug || 
      generateSlug(p.name) === querySlug ||
      p.slug.toLowerCase() === querySlug
  );
  if (slugMatch) return slugMatch;

  // 3. Fallback: contains or startsWith for partial slug matches
  return products.find(
    (p) => 
      (querySlug.length >= 5 && p.slug.toLowerCase().includes(querySlug)) ||
      (querySlug.length >= 5 && querySlug.includes(p.slug.toLowerCase()))
  );
}

/**
 * Robust matcher for finding a category from a URL slug or query.
 * e.g. 'tech-electronics' or 'Tech & Electronics'
 */
export function findCategoryBySlug(categories: string[], query: string): string | undefined {
  if (!query || !categories || categories.length === 0) return undefined;

  let decoded = query.trim();
  try {
    decoded = decodeURIComponent(query).trim();
  } catch (e) {
    // fallback
  }
  const queryLower = decoded.toLowerCase();
  const querySlug = generateSlug(decoded);

  // 1. Direct case-insensitive match
  const directMatch = categories.find((c) => c.toLowerCase() === queryLower);
  if (directMatch) return directMatch;

  // 2. Slugified match
  return categories.find((c) => generateSlug(c) === querySlug);
}

/**
 * Retrieve all products synchronously from local cache & bundled initial products.
 * Never throws, always safe.
 */
export function getStoredProducts(): Product[] {
  const fileProducts: Product[] = Array.isArray(INITIAL_PRODUCTS) ? INITIAL_PRODUCTS : [];
  if (typeof window === 'undefined') return fileProducts;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    let localList: Product[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        localList = parsed;
      }
    }

    // Also scan legacy storage keys safely without deleting them
    if (localList.length === 0) {
      const rescued = scanAllLocallyStoredProducts();
      if (rescued.length > 0) {
        localList = rescued;
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(localList));
      }
    }

    // Merge: All 10 bundled products from products.json are guaranteed to be present on all devices,
    // plus any new custom products added locally by the user.
    const fileIds = new Set(fileProducts.map((p) => p.id));
    const fileSlugs = new Set(fileProducts.map((p) => p.slug.toLowerCase()));
    const merged = [...fileProducts];

    for (const lp of localList) {
      if (!fileIds.has(lp.id) && !fileSlugs.has(lp.slug.toLowerCase())) {
        merged.unshift(lp); // User's custom added deals at top
      }
    }

    return merged;
  } catch (e) {
    console.warn('Failed to load products from storage', e);
    return fileProducts;
  }
}

/**
 * Asynchronously fetch latest products from the online database.
 * Updates local cache and returns the synchronized list.
 */
export async function fetchFreshProducts(): Promise<Product[]> {
  const fallback = getStoredProducts();
  try {
    const onlineProducts = await fetchOnlineProducts();
    if (onlineProducts && onlineProducts.length > 0) {
      // Merge online products with fallback to ensure nothing is lost
      const onlineIds = new Set(onlineProducts.map((p) => p.id));
      const onlineSlugs = new Set(onlineProducts.map((p) => p.slug.toLowerCase()));
      const combined = [...onlineProducts];

      // Keep any local additions not yet in online DB
      for (const p of fallback) {
        if (!onlineIds.has(p.id) && !onlineSlugs.has(p.slug.toLowerCase())) {
          combined.push(p);
        }
      }

      // Update local cache
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(combined));
      } catch (e) {
        // quota
      }

      return combined;
    }
  } catch (err) {
    console.warn('Could not fetch products from online database:', err);
  }
  return fallback;
}

/**
 * Asynchronously sync current products to disk via Vite dev server
 * so they are committed into src/data/products.json for production builds if running in dev.
 */
export async function syncProductsToServer(products: Product[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
  } catch (e) {
    // Expected on static hosting like Netlify where no dynamic local node API exists.
  }
}

/**
 * Synchronize whatever products are currently in the user's browser localStorage
 * with the server-side products.json file.
 */
export async function syncLocalProductsWithServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const products = getStoredProducts();
    if (products.length > 0) {
      await syncProductsToServer(products);
    }
  } catch (e) {
    // Ignore error in static environments
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    syncProductsToServer(products);
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export function getStoredCategories(): string[] {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch (e) {
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export async function addProductToStorage(productData: Omit<Product, 'id' | 'slug' | 'createdAt'>): Promise<Product> {
  const products = getStoredProducts();
  let baseSlug = generateSlug(productData.name);
  if (!baseSlug) baseSlug = 'product';
  
  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (products.some((p) => p.slug.toLowerCase() === slug.toLowerCase())) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const id = `prod-${Date.now()}`;
  const newProduct: Product = {
    ...productData,
    id,
    slug,
    createdAt: new Date().toISOString()
  };

  const updated = [newProduct, ...products];
  saveProducts(updated);

  // Asynchronously save to online database (Supabase / Firebase)
  saveProductToOnlineDb(newProduct).catch((err) => {
    console.warn('Could not save to online database:', err);
  });

  // Ensure category is in categories list
  if (productData.category) {
    const cats = getStoredCategories();
    if (!cats.includes(productData.category)) {
      saveCategories([...cats, productData.category]);
    }
  }

  return newProduct;
}

export async function updateProductInStorage(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProduct = {
    ...products[index],
    ...updates,
  };

  products[index] = updatedProduct;
  saveProducts(products);

  // Asynchronously update in online database
  saveProductToOnlineDb(updatedProduct).catch((err) => {
    console.warn('Could not update in online database:', err);
  });

  return updatedProduct;
}

export async function deleteProductFromStorage(id: string): Promise<void> {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);

  // Asynchronously delete from online database
  deleteProductFromOnlineDb(id).catch((err) => {
    console.warn('Could not delete from online database:', err);
  });
}

export function clearAllProducts(): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
    syncProductsToServer([]);
  } catch (e) {
    console.error(e);
  }
}

export function getProductShareUrl(product: Product): string {
  if (typeof window === 'undefined') {
    return `https://dealsonpoint.com/product/${product.slug}`;
  }
  return `${window.location.origin}/product/${product.slug}`;
}

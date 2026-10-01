import { Product } from '../types/product';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialProducts';

const STORAGE_KEY_PRODUCTS = 'deals_on_point_products_v2';
const STORAGE_KEY_CATEGORIES = 'deals_on_point_categories_v2';
const LEGACY_STORAGE_KEYS = [
  'deals_on_point_products',
  'deals_on_point_products_v1',
  'deals_on_point_demo_products'
];

/**
 * Remove obsolete legacy storage keys that may contain old or demo products
 * from previous iterations, ensuring Netlify and local browsers stay clean.
 */
export function cleanLegacyStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // Ignore storage restrictions
  }
}

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
 * Retrieve all products.
 * Merges the bundled production dataset (products.json / INITIAL_PRODUCTS)
 * with any locally saved updates in localStorage.
 */
export function getStoredProducts(): Product[] {
  cleanLegacyStorage();

  const fileProducts: Product[] = Array.isArray(INITIAL_PRODUCTS) ? INITIAL_PRODUCTS : [];
  if (typeof window === 'undefined') return fileProducts;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      if (fileProducts.length > 0) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(fileProducts));
      }
      return fileProducts;
    }

    const localList: Product[] = JSON.parse(raw);
    if (!Array.isArray(localList)) {
      return fileProducts;
    }

    // Merge: Preserve all local products, and ensure all file-bundled products exist
    const localIds = new Set(localList.map((p) => p.id));
    const localSlugs = new Set(localList.map((p) => p.slug.toLowerCase()));
    const merged = [...localList];

    for (const fp of fileProducts) {
      if (!localIds.has(fp.id) && !localSlugs.has(fp.slug.toLowerCase())) {
        merged.push(fp);
      }
    }

    return merged;
  } catch (e) {
    console.warn('Failed to load products from storage', e);
    return fileProducts;
  }
}

/**
 * Asynchronously sync current products to disk via Vite dev server
 * so they are committed into src/data/products.json for production builds.
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
    // Expected on static hosting like Netlify where no dynamic API exists.
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
    // Asynchronously update source of truth on disk when running in development
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

export function addProductToStorage(productData: Omit<Product, 'id' | 'slug' | 'createdAt'>): Product {
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

  // Ensure category is in categories list
  if (productData.category) {
    const cats = getStoredCategories();
    if (!cats.includes(productData.category)) {
      saveCategories([...cats, productData.category]);
    }
  }

  return newProduct;
}

export function updateProductInStorage(id: string, updates: Partial<Product>): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProduct = {
    ...products[index],
    ...updates,
  };

  products[index] = updatedProduct;
  saveProducts(products);
  return updatedProduct;
}

export function deleteProductFromStorage(id: string): void {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);
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

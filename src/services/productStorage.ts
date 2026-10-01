import { Product } from '../types/product';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialProducts';

const STORAGE_KEY_PRODUCTS = 'deals_on_point_products_v2';
const STORAGE_KEY_CATEGORIES = 'deals_on_point_categories_v2';
const LEGACY_PRODUCT_KEYS = ['deals_on_point_products', 'deals_on_point_products_v1', 'products'];

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check legacy storage keys if v2 is empty
    for (const legacyKey of LEGACY_PRODUCT_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            // Migrate to v2
            saveProducts(parsedLegacy);
            return parsedLegacy;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    return INITIAL_PRODUCTS;
  } catch (e) {
    console.warn('Failed to load products from storage', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
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
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function addProductToStorage(productData: Omit<Product, 'id' | 'slug' | 'createdAt'>): Product {
  const products = getStoredProducts();
  let baseSlug = generateSlug(productData.name);
  if (!baseSlug) baseSlug = 'product';
  
  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (products.some(p => p.slug === slug)) {
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

  // Persist to Netlify Database API asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(err => console.warn('Could not persist product to backend API:', err));
  }

  return newProduct;
}

export function updateProductInStorage(id: string, updates: Partial<Product>): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedProduct = {
    ...products[index],
    ...updates,
  };

  products[index] = updatedProduct;
  saveProducts(products);

  // Persist update to Netlify Database API asynchronously
  if (typeof window !== 'undefined') {
    fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(err => console.warn('Could not update product on backend API:', err));
  }

  return updatedProduct;
}

export function deleteProductFromStorage(id: string): void {
  const products = getStoredProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);

  // Persist delete to Netlify Database API asynchronously
  if (typeof window !== 'undefined') {
    fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Could not delete product on backend API:', err));
  }
}

export function clearAllProducts(): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
  } catch (e) {
    console.error(e);
  }
}

// Fetch products from Netlify Database API with automatic bidirectional sync
export async function fetchProductsFromBackend(): Promise<Product[]> {
  const localProducts = getStoredProducts();

  if (typeof window === 'undefined') return localProducts;

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const serverProducts = await res.json();
      if (Array.isArray(serverProducts)) {
        if (serverProducts.length > 0) {
          // Server has products, update local storage
          saveProducts(serverProducts);
          return serverProducts;
        } else if (localProducts.length > 0) {
          // Server database is empty, but local browser has user's manual products:
          // Automatically sync local products to the Netlify Database so they persist!
          try {
            const syncRes = await fetch('/api/products/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: localProducts }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (syncData.products && Array.isArray(syncData.products)) {
                saveProducts(syncData.products);
                return syncData.products;
              }
            }
          } catch (syncErr) {
            console.warn('Auto-sync to database failed:', syncErr);
          }
          return localProducts;
        }
      }
    }
  } catch (e) {
    console.warn('Backend API not reachable, using local storage cache', e);
  }

  return localProducts;
}

// Fetch categories from Netlify Database API
export async function fetchCategoriesFromBackend(): Promise<string[]> {
  const localCats = getStoredCategories();
  if (typeof window === 'undefined') return localCats;

  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const serverCats = await res.json();
      if (Array.isArray(serverCats) && serverCats.length > 0) {
        saveCategories(serverCats);
        return serverCats;
      }
    }
  } catch (e) {
    // fallback
  }

  return localCats;
}

// Manually trigger a full sync of local products to the backend database
export async function syncLocalProductsToBackend(): Promise<{ success: boolean; count: number }> {
  const localProducts = getStoredProducts();
  if (localProducts.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const res = await fetch('/api/products/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: localProducts }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        saveProducts(data.products);
      }
      return { success: true, count: (data.insertedCount || 0) + (data.updatedCount || 0) };
    }
  } catch (e) {
    console.error('Manual sync failed:', e);
  }

  return { success: false, count: 0 };
}

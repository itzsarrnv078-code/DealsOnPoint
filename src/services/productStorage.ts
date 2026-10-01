import { Product } from '../types/product';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialProducts';

const STORAGE_KEY_PRODUCTS = 'deals_on_point_products_v2';
const STORAGE_KEY_CATEGORIES = 'deals_on_point_categories_v2';

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load products from storage', e);
    return [];
  }
}

export function saveProducts(products: Product[]): void {
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
  return updatedProduct;
}

export function deleteProductFromStorage(id: string): void {
  const products = getStoredProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
}

export function clearAllProducts(): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
  } catch (e) {
    console.error(e);
  }
}

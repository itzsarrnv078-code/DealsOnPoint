import { Product } from '../types/product';
import productsData from './products.json';

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

// Single source of truth for products bundled into the production build.
export const INITIAL_PRODUCTS: Product[] = (Array.isArray(productsData) ? (productsData as unknown as Product[]) : []);

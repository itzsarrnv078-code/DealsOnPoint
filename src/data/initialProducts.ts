import { Product } from '../types/product';
import productsData from './products.json';

export const INITIAL_CATEGORIES = [
  'Tech & Electronics',
  'Gaming',
  'Phone Accessories',
  'Automotive',
  'Home & Kitchen',
  'Kitchen & Dining',
  'Home & Garden',
  'Fashion',
  'Beauty & Personal Care',
  'Daily Essentials',
  'Home Security'
];

// Single source of truth for products bundled into the production build.
export const INITIAL_PRODUCTS: Product[] = (Array.isArray(productsData) ? (productsData as unknown as Product[]) : []);

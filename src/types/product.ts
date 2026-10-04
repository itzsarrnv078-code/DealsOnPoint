export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  keyFeatures: string[];
  details?: Record<string, string | undefined>;
  mainImage: string;
  galleryImages: string[];
  amazonUrl: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  isNewDeal: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  badge?: 'NEW' | 'NEW DEAL' | 'TRENDING';
  createdAt: string;
}

export type NavSection = 'home' | 'deals' | 'new-deals' | 'new-arrivals' | 'categories' | 'about';

export type LegalModalType = 'about' | 'contact' | 'disclosure' | 'privacy' | 'terms' | null;

import type { LegalModalType, NavSection } from '../types/product';

export function routeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productPath(slug: string): string {
  return `/products/${encodeURIComponent(slug)}`;
}

export function categoryPath(category: string): string {
  return `/categories/${encodeURIComponent(routeSlug(category))}`;
}

export function sectionPath(section: NavSection): string {
  return section === 'home' ? '/' : `/${section}`;
}

export function legalPath(type: LegalModalType): string {
  if (!type) return '/';
  if (type === 'disclosure') return '/affiliate-disclosure';
  if (type === 'privacy') return '/privacy-policy';
  if (type === 'terms') return '/terms-and-conditions';
  return `/${type}`;
}

export function shouldNavigate(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  );
}

export function parseRoute(url: URL) {
  let path: string;
  try {
    path = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
  } catch {
    path = url.pathname.replace(/\/+$/, '') || '/';
  }

  const productMatch = path.match(/^\/products?\/([^/]+)$/i);
  const categoryMatch = path.match(/^\/categor(?:y|ies)\/([^/]+)$/i);

  const sections: Record<string, NavSection> = {
    '/': 'home',
    '/deals': 'deals',
    '/new-deals': 'new-deals',
    '/new-arrivals': 'new-arrivals',
    '/categories': 'categories',
    '/about': 'about',
  };

  const legalRoutes: Record<string, LegalModalType> = {
    '/about': 'about',
    '/contact': 'contact',
    '/disclosure': 'disclosure',
    '/affiliate-disclosure': 'disclosure',
    '/privacy': 'privacy',
    '/privacy-policy': 'privacy',
    '/terms': 'terms',
    '/terms-and-conditions': 'terms',
  };

  const hashSections: Record<string, NavSection> = {
    '#deals-section': 'deals',
    '#new-arrivals-section': 'new-arrivals',
    '#categories-section': 'categories',
    '#about-section': 'about',
  };

  const lowerPath = path.toLowerCase();
  const rawProductSlug = productMatch?.[1] || (lowerPath === '/' ? url.searchParams.get('product') : null);
  const rawCategorySlug = categoryMatch?.[1] || null;

  return {
    productSlug: rawProductSlug ? decodeURIComponent(rawProductSlug) : null,
    categorySlug: rawCategorySlug ? decodeURIComponent(rawCategorySlug) : null,
    section: sections[lowerPath] || (categoryMatch ? 'categories' : 'home'),
    scrollSection: hashSections[url.hash.toLowerCase()] || sections[lowerPath] || 'home',
    legal: legalRoutes[lowerPath] || null,
    search: url.searchParams.get('q') || '',
    notFound: !productMatch && !categoryMatch && !sections[lowerPath] && !legalRoutes[lowerPath],
  };
}

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { 
  parseRoute, 
  routeSlug, 
  productPath, 
  categoryPath, 
  sectionPath, 
  legalPath 
} from '../src/services/routing.ts';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../src/data/initialProducts.ts';

describe('SPA Routing and Slug Generation', () => {
  it('correctly generates slugs from titles with punctuation and accents', () => {
    assert.equal(
      routeSlug('LINKCHEF 10-Cup Electric Food Processor Chopper'),
      'linkchef-10-cup-electric-food-processor-chopper'
    );
    assert.equal(routeSlug('Tech & Electronics'), 'tech-electronics');
    assert.equal(routeSlug('  Extra  Spaces  -- and Symbols!! '), 'extra-spaces-and-symbols');
  });

  it('correctly generates URL paths', () => {
    assert.equal(
      productPath('linkchef-10-cup-electric-food-processor-chopper'),
      '/products/linkchef-10-cup-electric-food-processor-chopper'
    );
    assert.equal(categoryPath('Home & Kitchen'), '/categories/home-kitchen');
    assert.equal(sectionPath('deals'), '/deals');
    assert.equal(sectionPath('home'), '/');
    assert.equal(legalPath('disclosure'), '/affiliate-disclosure');
    assert.equal(legalPath('privacy'), '/privacy-policy');
    assert.equal(legalPath('terms'), '/terms-and-conditions');
    assert.equal(legalPath('contact'), '/contact');
    assert.equal(legalPath('about'), '/about');
  });

  it('parses direct product URLs including the LINKCHEF URL', () => {
    const directUrl = new URL('https://dealsonpoint.com/products/linkchef-10-cup-electric-food-processor-chopper');
    const result = parseRoute(directUrl);
    assert.equal(result.productSlug, 'linkchef-10-cup-electric-food-processor-chopper');
    assert.equal(result.notFound, false);
  });

  it('parses product URLs with trailing slashes and singular /product prefix', () => {
    const trailingSlashUrl = new URL('https://dealsonpoint.com/products/linkchef-10-cup-electric-food-processor-chopper/');
    const parsed1 = parseRoute(trailingSlashUrl);
    assert.equal(parsed1.productSlug, 'linkchef-10-cup-electric-food-processor-chopper');
    assert.equal(parsed1.notFound, false);

    const singularUrl = new URL('https://dealsonpoint.com/product/linkchef-10-cup-electric-food-processor-chopper');
    const parsed2 = parseRoute(singularUrl);
    assert.equal(parsed2.productSlug, 'linkchef-10-cup-electric-food-processor-chopper');
    assert.equal(parsed2.notFound, false);
  });

  it('parses category URLs for both /categories/ and /category/', () => {
    const catUrl1 = new URL('https://dealsonpoint.com/categories/home-kitchen');
    const res1 = parseRoute(catUrl1);
    assert.equal(res1.categorySlug, 'home-kitchen');
    assert.equal(res1.section, 'categories');
    assert.equal(res1.notFound, false);

    const catUrl2 = new URL('https://dealsonpoint.com/category/tech-electronics');
    const res2 = parseRoute(catUrl2);
    assert.equal(res2.categorySlug, 'tech-electronics');
    assert.equal(res2.notFound, false);
  });

  it('parses search query parameters', () => {
    const searchUrl = new URL('https://dealsonpoint.com/?q=food+processor');
    const res = parseRoute(searchUrl);
    assert.equal(res.search, 'food processor');
    assert.equal(res.section, 'home');
    assert.equal(res.notFound, false);
  });

  it('parses legal and policy routes', () => {
    assert.equal(parseRoute(new URL('https://dealsonpoint.com/affiliate-disclosure')).legal, 'disclosure');
    assert.equal(parseRoute(new URL('https://dealsonpoint.com/privacy-policy')).legal, 'privacy');
    assert.equal(parseRoute(new URL('https://dealsonpoint.com/terms-and-conditions')).legal, 'terms');
    assert.equal(parseRoute(new URL('https://dealsonpoint.com/contact')).legal, 'contact');
    assert.equal(parseRoute(new URL('https://dealsonpoint.com/about')).legal, 'about');
  });

  it('identifies unknown/garbage routes as notFound', () => {
    const badUrl = new URL('https://dealsonpoint.com/random-invalid-page-xyz');
    const res = parseRoute(badUrl);
    assert.equal(res.notFound, true);
  });
});

describe('Product Catalog Integrity', () => {
  it('contains the LINKCHEF 10-Cup Electric Food Processor Chopper product', () => {
    const linkchef = INITIAL_PRODUCTS.find(
      (p) => p.slug === 'linkchef-10-cup-electric-food-processor-chopper'
    );
    assert.ok(linkchef, 'LINKCHEF product must be present in initial catalog');
    assert.equal(linkchef.name, 'LINKCHEF 10-Cup Electric Food Processor Chopper');
    assert.equal(linkchef.category, 'Home & Kitchen');
    assert.ok(linkchef.amazonUrl.includes('tag='), 'Must have an Amazon Associates tag');
    assert.ok(linkchef.keyFeatures.length >= 4, 'Must have detailed key features');
    assert.ok(linkchef.details && Object.keys(linkchef.details).length >= 4, 'Must have specifications');
  });

  it('all products have valid categories, descriptions, and images', () => {
    assert.ok(INITIAL_PRODUCTS.length >= 5, 'Should have at least 5 products');
    for (const p of INITIAL_PRODUCTS) {
      assert.ok(p.id, `Product ${p.slug} must have an id`);
      assert.ok(p.name, `Product ${p.slug} must have a name`);
      assert.ok(INITIAL_CATEGORIES.includes(p.category), `Product ${p.name} category ${p.category} must be in INITIAL_CATEGORIES`);
      assert.ok(p.mainImage, `Product ${p.name} must have a main image`);
      assert.ok(p.shortDescription, `Product ${p.name} must have a short description`);
      assert.ok(p.amazonUrl.startsWith('https://www.amazon.com'), `Product ${p.name} amazonUrl must be valid Amazon link`);
    }
  });
});

describe('Netlify Deployment and Redirect Configuration', () => {
  it('netlify.toml contains SPA redirect rule /* -> /index.html 200', () => {
    const netlifyToml = fs.readFileSync(path.resolve(process.cwd(), 'netlify.toml'), 'utf-8');
    assert.match(netlifyToml, /\[\[redirects\]\]/, 'netlify.toml must have [[redirects]]');
    assert.match(netlifyToml, /from\s*=\s*"(\/\*|\/\*)"/, 'netlify.toml must redirect from /*');
    assert.match(netlifyToml, /to\s*=\s*"\/index\.html"/, 'netlify.toml must redirect to /index.html');
    assert.match(netlifyToml, /status\s*=\s*200/, 'netlify.toml redirect must have status 200');
  });

  it('public/_redirects contains SPA redirect rule /* /index.html 200', () => {
    const redirectsFile = fs.readFileSync(path.resolve(process.cwd(), 'public/_redirects'), 'utf-8');
    assert.match(redirectsFile, /\/\*\s+\/index\.html\s+200/, 'public/_redirects must route /* to /index.html with status 200');
  });
});

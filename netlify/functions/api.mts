import type { Config, Context } from '@netlify/functions';
import { db } from '../../db/index.js';
import { products, categories } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_CATEGORIES } from '../../src/data/initialProducts.js';

interface ProductInput {
  id?: string;
  slug?: string;
  name: string;
  category: string;
  shortDescription: string;
  keyFeatures?: string[];
  details?: Record<string, string>;
  mainImage: string;
  galleryImages?: string[];
  amazonUrl: string;
  isNewDeal?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  badge?: 'NEW' | 'NEW DEAL' | 'TRENDING';
  createdAt?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/\.netlify\/functions\/api/, '/api');
  const method = req.method.toUpperCase();

  // CORS headers if needed for same-site or cross-origin previews
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // 1. GET /api/products
    if (pathname === '/api/products' && method === 'GET') {
      try {
        const allProducts = await db
          .select()
          .from(products)
          .orderBy(desc(products.createdAt));
        return Response.json(allProducts, { headers });
      } catch (err: any) {
        console.warn('Database query error (table might be provisioning):', err?.message);
        return Response.json([], { headers });
      }
    }

    // 2. POST /api/products
    if (pathname === '/api/products' && method === 'POST') {
      const data: ProductInput = await req.json();
      if (!data.name || !data.category) {
        return Response.json({ error: 'Missing required fields' }, { status: 400, headers });
      }

      const id = data.id || `prod-${Date.now()}`;
      let baseSlug = data.slug || generateSlug(data.name);
      if (!baseSlug) baseSlug = 'product';

      const newProduct = {
        id,
        slug: baseSlug,
        name: data.name.trim(),
        category: data.category.trim(),
        shortDescription: (data.shortDescription || '').trim(),
        keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
        details: data.details || null,
        mainImage: data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        galleryImages: Array.isArray(data.galleryImages) && data.galleryImages.length > 0 
          ? data.galleryImages 
          : [data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
        amazonUrl: (data.amazonUrl || 'https://www.amazon.com').trim(),
        isNewDeal: Boolean(data.isNewDeal),
        isNewArrival: Boolean(data.isNewArrival),
        isTrending: Boolean(data.isTrending),
        badge: data.badge || (data.isNewDeal ? 'NEW DEAL' : data.isTrending ? 'TRENDING' : data.isNewArrival ? 'NEW' : null),
        createdAt: data.createdAt || new Date().toISOString(),
      };

      try {
        await db.insert(products).values(newProduct);
      } catch (insertErr: any) {
        console.warn('DB insert notice (table may be pending deploy migration):', insertErr?.message);
        if (insertErr?.message?.includes('duplicate key') || insertErr?.message?.includes('unique constraint')) {
          try {
            const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
            newProduct.slug = uniqueSlug;
            await db.insert(products).values(newProduct);
          } catch (e) {
            // ignore
          }
        }
      }

      return Response.json(newProduct, { status: 201, headers });
    }

    // 3. POST /api/products/sync (Bulk sync from localStorage to Database)
    if (pathname === '/api/products/sync' && method === 'POST') {
      const { items } = await req.json();
      if (!Array.isArray(items)) {
        return Response.json({ error: 'Expected items array' }, { status: 400, headers });
      }

      let insertedCount = 0;
      let updatedCount = 0;

      for (const item of items) {
        if (!item || !item.name) continue;
        const id = item.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const slug = item.slug || generateSlug(item.name);

        const record = {
          id,
          slug,
          name: item.name.trim(),
          category: (item.category || 'Tech & Electronics').trim(),
          shortDescription: (item.shortDescription || '').trim(),
          keyFeatures: Array.isArray(item.keyFeatures) ? item.keyFeatures : [],
          details: item.details || null,
          mainImage: item.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          galleryImages: Array.isArray(item.galleryImages) && item.galleryImages.length > 0 ? item.galleryImages : [item.mainImage],
          amazonUrl: (item.amazonUrl || 'https://www.amazon.com').trim(),
          isNewDeal: Boolean(item.isNewDeal),
          isNewArrival: Boolean(item.isNewArrival),
          isTrending: Boolean(item.isTrending),
          badge: item.badge || null,
          createdAt: item.createdAt || new Date().toISOString(),
        };

        try {
          const existing = await db.select().from(products).where(eq(products.id, id));
          if (existing.length > 0) {
            await db.update(products).set(record).where(eq(products.id, id));
            updatedCount++;
          } else {
            await db.insert(products).values(record);
            insertedCount++;
          }
        } catch (e: any) {
          console.warn(`Sync failed for item ${id}:`, e?.message);
        }
      }

      let all: any[] = [];
      try {
        all = await db.select().from(products).orderBy(desc(products.createdAt));
      } catch (e: any) {
        // table pending deploy migration
      }
      return Response.json({ 
        success: true, 
        insertedCount, 
        updatedCount, 
        products: all.length > 0 ? all : items 
      }, { headers });
    }

    // 4. PUT /api/products/:id
    if (pathname.startsWith('/api/products/') && method === 'PUT') {
      const id = pathname.replace('/api/products/', '');
      const updates = await req.json();

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.category !== undefined) updateData.category = updates.category.trim();
      if (updates.shortDescription !== undefined) updateData.shortDescription = updates.shortDescription.trim();
      if (updates.keyFeatures !== undefined) updateData.keyFeatures = updates.keyFeatures;
      if (updates.details !== undefined) updateData.details = updates.details;
      if (updates.mainImage !== undefined) updateData.mainImage = updates.mainImage;
      if (updates.galleryImages !== undefined) updateData.galleryImages = updates.galleryImages;
      if (updates.amazonUrl !== undefined) updateData.amazonUrl = updates.amazonUrl.trim();
      if (updates.isNewDeal !== undefined) updateData.isNewDeal = Boolean(updates.isNewDeal);
      if (updates.isNewArrival !== undefined) updateData.isNewArrival = Boolean(updates.isNewArrival);
      if (updates.isTrending !== undefined) updateData.isTrending = Boolean(updates.isTrending);
      if (updates.badge !== undefined) updateData.badge = updates.badge;

      await db.update(products).set(updateData).where(eq(products.id, id));
      const [updated] = await db.select().from(products).where(eq(products.id, id));
      return Response.json(updated || { id }, { headers });
    }

    // 5. DELETE /api/products/:id
    if (pathname.startsWith('/api/products/') && method === 'DELETE') {
      const id = pathname.replace('/api/products/', '');
      await db.delete(products).where(eq(products.id, id));
      return Response.json({ success: true, id }, { headers });
    }

    // 6. GET /api/categories
    if (pathname === '/api/categories' && method === 'GET') {
      try {
        const dbCats = await db.select().from(categories);
        const catNames = Array.from(new Set([
          ...INITIAL_CATEGORIES,
          ...dbCats.map((c) => c.name)
        ]));
        return Response.json(catNames, { headers });
      } catch (e: any) {
        return Response.json(INITIAL_CATEGORIES, { headers });
      }
    }

    // 7. POST /api/categories
    if (pathname === '/api/categories' && method === 'POST') {
      const { name } = await req.json();
      if (name && name.trim()) {
        try {
          await db.insert(categories).values({ name: name.trim() });
        } catch (e) {
          // ignore unique constraint
        }
      }
      return Response.json({ success: true, name }, { headers });
    }

    return Response.json({ error: 'Endpoint not found' }, { status: 404, headers });
  } catch (error: any) {
    console.error('API Error:', error);
    return Response.json({ error: error?.message || 'Server error' }, { status: 500, headers });
  }
};

export const config: Config = {
  path: '/api/*',
};

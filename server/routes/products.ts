import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db, toProduct, type ProductRow } from '../db.js';
import { requireStaff } from '../auth.js';

const productSchema = z.object({
  id: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9._-]+$/, 'Use letters, numbers, dot, dash or underscore'),
  brand: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).default(''),
  features: z.array(z.string().trim().max(200)).max(20).default([]),
  image: z.string().trim().url(),
  images: z.array(z.string().trim().url()).max(10).default([]),
  category: z.string().trim().min(1).max(80),
  price: z.number().int().positive(),
  mrp: z.number().int().positive().nullable().default(null),
  stock: z.number().int().min(0).nullable().default(null),
  b2bPrice: z.number().int().positive().nullable().default(null),
  b2bMinQty: z.number().int().min(1).default(10),
  active: z.boolean().default(true),
});

const SORTS: Record<string, string> = {
  featured: 'COALESCE(stock, 1) > 0 DESC, created_at ASC',
  'price-asc': 'price ASC',
  'price-desc': 'price DESC',
  newest: 'created_at DESC',
  discount: 'CASE WHEN mrp IS NULL THEN 0 ELSE (mrp - price) * 1.0 / mrp END DESC',
};

export const productRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/products', async (req) => {
    const q = req.query as { brand?: string; category?: string; search?: string; sort?: string; inStock?: string; all?: string };
    const isStaff = req.user && (req.user.role === 'seller' || req.user.role === 'owner');
    const where: string[] = [];
    const params: unknown[] = [];
    if (!(isStaff && q.all === '1')) where.push('active = 1');
    if (q.brand && q.brand !== 'All') { where.push('brand = ?'); params.push(q.brand); }
    if (q.category && q.category !== 'All') { where.push('category = ?'); params.push(q.category); }
    if (q.inStock === '1') where.push('(stock IS NULL OR stock > 0)');
    if (q.search) {
      where.push('(name LIKE ? OR category LIKE ? OR id LIKE ? OR description LIKE ?)');
      const s = `%${q.search}%`;
      params.push(s, s, s, s);
    }
    const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${SORTS[q.sort ?? ''] ?? SORTS.featured}`;
    return (db.prepare(sql).all(...params) as ProductRow[]).map(toProduct);
  });

  app.get('/api/products/meta', async () => {
    const categories = db.prepare(`SELECT category, COUNT(*) AS count FROM products WHERE active = 1 GROUP BY category ORDER BY category`).all();
    const brands = db.prepare(`SELECT brand, COUNT(*) AS count FROM products WHERE active = 1 GROUP BY brand ORDER BY brand`).all();
    return { categories, brands };
  });

  app.get('/api/products/:id', async (req, reply) => {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get((req.params as { id: string }).id) as ProductRow | undefined;
    if (!row || (!row.active && req.user?.role !== 'owner' && req.user?.role !== 'seller')) {
      return reply.status(404).send({ error: 'Product not found.' });
    }
    return toProduct(row);
  });

  app.post('/api/products', { preHandler: requireStaff }, async (req, reply) => {
    const p = productSchema.parse(req.body);
    if (db.prepare('SELECT 1 FROM products WHERE id = ?').get(p.id)) {
      return reply.status(409).send({ error: `A product with SKU ${p.id} already exists.` });
    }
    db.prepare(`INSERT INTO products (id, brand, name, description, features, image, images, category, price, mrp, stock, b2b_price, b2b_min_qty, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      p.id, p.brand, p.name, p.description, JSON.stringify(p.features), p.image, JSON.stringify(p.images), p.category,
      p.price, p.mrp, p.stock, p.b2bPrice, p.b2bMinQty, p.active ? 1 : 0,
    );
    return reply.status(201).send(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(p.id) as ProductRow));
  });

  app.put('/api/products/:id', { preHandler: requireStaff }, async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const p = productSchema.parse({ ...(req.body as object), id });
    const res = db.prepare(`UPDATE products SET brand = ?, name = ?, description = ?, features = ?, image = ?, images = ?, category = ?,
      price = ?, mrp = ?, stock = ?, b2b_price = ?, b2b_min_qty = ?, active = ?, updated_at = datetime('now') WHERE id = ?`).run(
      p.brand, p.name, p.description, JSON.stringify(p.features), p.image, JSON.stringify(p.images), p.category,
      p.price, p.mrp, p.stock, p.b2bPrice, p.b2bMinQty, p.active ? 1 : 0, id,
    );
    if (!res.changes) return reply.status(404).send({ error: 'Product not found.' });
    return toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow);
  });

  // Quick stock adjustment from the inventory table.
  app.patch('/api/products/:id/stock', { preHandler: requireStaff }, async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const { stock } = z.object({ stock: z.number().int().min(0).nullable() }).parse(req.body);
    const res = db.prepare(`UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`).run(stock, id);
    if (!res.changes) return reply.status(404).send({ error: 'Product not found.' });
    return { ok: true };
  });

  app.delete('/api/products/:id', { preHandler: requireStaff }, async (req) => {
    // Past orders keep their own copy of name/price, so removing a product is safe.
    db.prepare('DELETE FROM products WHERE id = ?').run((req.params as { id: string }).id);
    return { ok: true };
  });
};

import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { db, seedProducts, type SeedProduct } from './db.js';
import { attachUser, ensureOwnerAccount } from './auth.js';
import { SEED_PRODUCTS } from './seed-products.js';
import { authRoutes } from './routes/auth.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { inquiryRoutes } from './routes/inquiries.js';
import { analyticsRoutes } from './routes/analytics.js';
import { aiRoutes } from './routes/ai.js';
import { autoPostPlugin } from './autopost.js';
import { startScheduler } from './services/scheduler.js';
import { notifyBusiness } from './notify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5000);

const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 1024 * 1024 });

const allowedOrigins = (process.env.CORS_ORIGINS ||
  'https://spaenterprise.in,https://www.spaenterprise.in,http://localhost:3000,http://127.0.0.1:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);

await app.register(cors, {
  origin: (origin, cb) => {
    // Allow same-origin/server-to-server requests and Vercel preview deployments.
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return cb(null, true);
    cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });

app.addHook('onRequest', attachUser);
app.addHook('onSend', async (_req, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

app.setErrorHandler((error, req, reply) => {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return reply.status(400).send({ error: first ? `${first.path.join('.') || 'input'}: ${first.message}` : 'Invalid input.' });
  }
  const status = (error as { statusCode?: number }).statusCode ?? 500;
  if (status >= 500) req.log.error(error);
  reply.status(status).send({ error: status >= 500 ? 'Something went wrong on our side. Please try again.' : (error as Error).message });
});

app.get('/api/health', async () => {
  db.prepare('SELECT 1').get();
  return { ok: true };
});

// Razorpay webhook: confirms payments even if the customer closes the browser
// before the checkout page reports back. Needs the raw body for the signature.
await app.register(async (scope) => {
  scope.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => done(null, body));
  scope.post('/api/payment/webhook', async (req, reply) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    if (!secret || typeof signature !== 'string') return reply.status(400).send({ error: 'Webhook not configured.' });
    const raw = req.body as string;
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return reply.status(400).send({ error: 'Bad signature.' });
    }
    const event = JSON.parse(raw);
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const order = payment?.order_id &&
        (db.prepare(`SELECT * FROM orders WHERE razorpay_order_id = ?`).get(payment.order_id) as any);
      if (order && order.payment_status !== 'paid') {
        // If the order had been auto-cancelled, put its stock back on hold before confirming it.
        db.transaction(() => {
          if (order.status === 'cancelled') {
            const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id) as { product_id: string; quantity: number }[];
            for (const i of items) db.prepare('UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ? AND stock IS NOT NULL').run(i.quantity, i.product_id);
          }
          db.prepare(`UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ?, status = CASE WHEN status IN ('pending', 'cancelled') THEN 'confirmed' ELSE status END,
            updated_at = datetime('now') WHERE id = ?`).run(payment.id, order.id);
        })();
        notifyBusiness(`Payment received for order ${order.order_number}: ₹${order.total}`, req.log);
      }
    }
    return { ok: true };
  });
});

await app.register(authRoutes);
await app.register(productRoutes);
await app.register(orderRoutes);
await app.register(inquiryRoutes);
await app.register(analyticsRoutes);
await app.register(aiRoutes);
await app.register(autoPostPlugin);

// Seed the catalog on first boot. A legacy db.json (from the old JSON-file backend) wins if present.
const legacyPath = path.join(__dirname, 'db.json');
let seed: SeedProduct[] = SEED_PRODUCTS;
if (fs.existsSync(legacyPath)) {
  try {
    const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
    const toNum = (v: unknown) => (typeof v === 'number' ? v : parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10) || 0);
    const fromLegacy = (legacy.products ?? []).map((p: any) => ({
      id: String(p.id), brand: p.brand, name: p.name, description: p.description ?? '', features: p.features ?? [],
      image: p.image ?? '', images: p.images ?? [], category: p.category ?? '', price: toNum(p.price), mrp: toNum(p.mrp) || null,
    })).filter((p: SeedProduct) => p.price > 0);
    if (fromLegacy.length > SEED_PRODUCTS.length / 2) seed = fromLegacy;
  } catch (e) {
    app.log.warn(e, 'Could not read legacy db.json; using built-in catalog.');
  }
}
const seeded = seedProducts(seed);
if (seeded) app.log.info(`Seeded ${seeded} products.`);
ensureOwnerAccount((m) => app.log.info(m));
startScheduler();

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

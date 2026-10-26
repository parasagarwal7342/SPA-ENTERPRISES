import crypto from 'crypto';
import type { FastifyPluginAsync } from 'fastify';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { db } from '../db.js';
import { requireRole, requireStaff } from '../auth.js';
import { priceCart, PricingError, SHIPPING_RULES } from '../pricing.js';
import { notifyBusiness } from '../notify.js';

const razorpayConfigured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const codEnabled = () => process.env.COD_ENABLED !== 'false';

const linesSchema = z.array(z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(500),
})).min(1).max(50);

const regionSchema = z.enum(['delhi', 'india', 'global']);

const checkoutSchema = z.object({
  items: linesSchema,
  shippingRegion: regionSchema,
  couponCode: z.string().trim().max(30).optional().nullable(),
  paymentMethod: z.enum(['razorpay', 'cod']),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, 'Enter a valid phone number'),
    address: z.string().trim().min(8).max(400),
    city: z.string().trim().min(2).max(80),
    pincode: z.string().trim().regex(/^[A-Za-z0-9 -]{4,10}$/, 'Enter a valid PIN code'),
  }),
  notes: z.string().trim().max(500).optional(),
});

const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as const;

function newOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `SPA-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function loadOrder(where: string, ...params: unknown[]) {
  const order = db.prepare(`SELECT * FROM orders WHERE ${where}`).get(...params) as any;
  if (!order) return null;
  const items = db.prepare(`SELECT product_id AS productId, name, brand, image, unit_price AS unitPrice, quantity FROM order_items WHERE order_id = ?`).all(order.id);
  return {
    id: order.id,
    orderNumber: order.order_number,
    customer: { name: order.customer_name, email: order.customer_email, phone: order.customer_phone, address: order.address, city: order.city, pincode: order.pincode },
    shippingRegion: order.shipping_region,
    subtotal: order.subtotal,
    discount: order.discount,
    couponCode: order.coupon_code,
    shippingFee: order.shipping_fee,
    total: order.total,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    status: order.status,
    trackingInfo: order.tracking_info,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items,
  };
}

// Stock is reserved when an order is placed and returned if it is cancelled.
const adjustStock = (orderId: number, direction: 1 | -1) => {
  const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(orderId) as { product_id: string; quantity: number }[];
  const stmt = db.prepare('UPDATE products SET stock = MAX(stock + ?, 0) WHERE id = ? AND stock IS NOT NULL');
  for (const i of items) stmt.run(direction * i.quantity, i.product_id);
};

export const orderRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/config', async () => ({
    paymentMethods: [...(razorpayConfigured() ? ['razorpay'] : []), ...(codEnabled() ? ['cod'] : [])],
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    shipping: SHIPPING_RULES,
    whatsappNumber: process.env.WHATSAPP_NUMBER || '919312277087',
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
  }));

  // Live price breakdown for the cart page; nothing is saved.
  app.post('/api/orders/quote', async (req, reply) => {
    const body = z.object({ items: linesSchema, shippingRegion: regionSchema, couponCode: z.string().trim().max(30).optional().nullable() }).parse(req.body);
    try {
      return priceCart(body.items, body.shippingRegion, body.couponCode);
    } catch (e) {
      if (e instanceof PricingError) return reply.status(400).send({ error: e.message });
      throw e;
    }
  });

  app.post('/api/orders', async (req, reply) => {
    const body = checkoutSchema.parse(req.body);
    if (body.paymentMethod === 'razorpay' && !razorpayConfigured()) {
      return reply.status(400).send({ error: 'Online payment is not available right now. Please choose Cash on Delivery.' });
    }
    if (body.paymentMethod === 'cod' && !codEnabled()) {
      return reply.status(400).send({ error: 'Cash on Delivery is not available right now.' });
    }
    if (body.paymentMethod === 'cod' && body.shippingRegion === 'global') {
      return reply.status(400).send({ error: 'Cash on Delivery is only available within India.' });
    }

    let pricing: ReturnType<typeof priceCart>;
    let orderId: number;
    const orderNumber = newOrderNumber();
    try {
      // Price check, stock reservation and insert happen atomically.
      orderId = db.transaction(() => {
        pricing = priceCart(body.items, body.shippingRegion, body.couponCode);
        const c = body.customer;
        const info = db.prepare(`INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, address, city, pincode,
          shipping_region, subtotal, shipping_fee, discount, coupon_code, total, payment_method, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          orderNumber, req.user?.id ?? null, c.name, c.email, c.phone, c.address, c.city, c.pincode,
          body.shippingRegion, pricing.subtotal, pricing.shippingFee, pricing.discount, pricing.couponCode, pricing.total,
          body.paymentMethod, body.paymentMethod === 'cod' ? 'confirmed' : 'pending', body.notes ?? null,
        );
        const id = Number(info.lastInsertRowid);
        const insertItem = db.prepare(`INSERT INTO order_items (order_id, product_id, name, brand, image, unit_price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const i of pricing.items) insertItem.run(id, i.productId, i.name, i.brand, i.image, i.unitPrice, i.quantity);
        adjustStock(id, -1);
        return id;
      })();
    } catch (e) {
      if (e instanceof PricingError) return reply.status(400).send({ error: e.message });
      throw e;
    }

    if (body.paymentMethod === 'cod') {
      const order = loadOrder('id = ?', orderId);
      notifyBusiness(`New COD order ${orderNumber}: ₹${order!.total} from ${body.customer.name} (${body.customer.phone})`, req.log);
      return { order };
    }

    try {
      const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
      const rzpOrder = await rzp.orders.create({ amount: pricing!.total * 100, currency: 'INR', receipt: orderNumber });
      db.prepare('UPDATE orders SET razorpay_order_id = ? WHERE id = ?').run(rzpOrder.id, orderId);
      return {
        order: loadOrder('id = ?', orderId),
        razorpay: { keyId: process.env.RAZORPAY_KEY_ID, orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency },
      };
    } catch (e) {
      req.log.error(e, 'Razorpay order creation failed');
      db.transaction(() => {
        adjustStock(orderId, 1);
        db.prepare(`UPDATE orders SET status = 'cancelled', payment_status = 'failed', updated_at = datetime('now') WHERE id = ?`).run(orderId);
      })();
      return reply.status(502).send({ error: 'Could not start the payment. Please try again or choose Cash on Delivery.' });
    }
  });

  app.post('/api/orders/:orderNumber/verify-payment', async (req, reply) => {
    const { orderNumber } = req.params as { orderNumber: string };
    const body = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
    }).parse(req.body);
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;
    if (!order || order.razorpay_order_id !== body.razorpay_order_id) {
      return reply.status(404).send({ error: 'Order not found.' });
    }
    if (order.payment_status === 'paid') return { order: loadOrder('id = ?', order.id) };

    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`).digest('hex');
    const valid = expected.length === body.razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(body.razorpay_signature));
    if (!valid) return reply.status(400).send({ error: 'Payment could not be verified. If money was deducted, please contact us.' });

    db.prepare(`UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ?, status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
      updated_at = datetime('now') WHERE id = ?`).run(body.razorpay_payment_id, order.id);
    notifyBusiness(`New PAID order ${orderNumber}: ₹${order.total} from ${order.customer_name} (${order.customer_phone})`, req.log);
    return { order: loadOrder('id = ?', order.id) };
  });

  // Customer closed the Razorpay window without paying: release the reserved stock.
  app.post('/api/orders/:orderNumber/abandon', async (req) => {
    const { orderNumber } = req.params as { orderNumber: string };
    const { razorpayOrderId } = z.object({ razorpayOrderId: z.string() }).parse(req.body);
    const order = db.prepare(`SELECT * FROM orders WHERE order_number = ? AND razorpay_order_id = ? AND payment_status = 'pending' AND status = 'pending'`)
      .get(orderNumber, razorpayOrderId) as any;
    if (order) {
      db.transaction(() => {
        adjustStock(order.id, 1);
        db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(order.id);
      })();
    }
    return { ok: true };
  });

  app.get('/api/orders/mine', { preHandler: requireRole() }, async (req) => {
    const ids = db.prepare('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.user!.id) as { id: number }[];
    return ids.map(({ id }) => loadOrder('id = ?', id));
  });

  // Public order tracking: order number plus the phone or email used at checkout.
  app.get('/api/orders/track', async (req, reply) => {
    const q = z.object({ orderNumber: z.string().trim().min(5), contact: z.string().trim().min(5) }).parse(req.query);
    const digits = q.contact.replace(/\D/g, '');
    const order = loadOrder(
      `order_number = ? COLLATE NOCASE AND (customer_email = ? COLLATE NOCASE OR (? <> '' AND REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '+', '') LIKE '%' || ?))`,
      q.orderNumber, q.contact, digits, digits.slice(-10),
    );
    if (!order) return reply.status(404).send({ error: 'No order matches those details.' });
    return order;
  });

  // ---- Staff order desk ----
  app.get('/api/staff/orders', { preHandler: requireStaff }, async (req) => {
    const q = req.query as { status?: string; search?: string };
    const where: string[] = [];
    const params: unknown[] = [];
    if (q.status && q.status !== 'all') { where.push('status = ?'); params.push(q.status); }
    if (q.search) {
      where.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?)');
      const s = `%${q.search}%`;
      params.push(s, s, s, s);
    }
    const ids = db.prepare(`SELECT id FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 300`).all(...params) as { id: number }[];
    return ids.map(({ id }) => loadOrder('id = ?', id));
  });

  app.patch('/api/staff/orders/:id', { preHandler: requireStaff }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const body = z.object({
      status: z.enum(ORDER_STATUSES).optional(),
      paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
      trackingInfo: z.string().trim().max(300).nullable().optional(),
      notes: z.string().trim().max(1000).nullable().optional(),
    }).parse(req.body);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) return reply.status(404).send({ error: 'Order not found.' });

    db.transaction(() => {
      if (body.status && body.status !== order.status) {
        if (body.status === 'cancelled') adjustStock(id, 1);
        if (order.status === 'cancelled') adjustStock(id, -1);
      }
      db.prepare(`UPDATE orders SET status = ?, payment_status = ?, tracking_info = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`).run(
        body.status ?? order.status,
        body.paymentStatus ?? order.payment_status,
        body.trackingInfo !== undefined ? body.trackingInfo : order.tracking_info,
        body.notes !== undefined ? body.notes : order.notes,
        id,
      );
    })();
    return loadOrder('id = ?', id);
  });
};

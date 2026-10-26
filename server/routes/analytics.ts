import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { requireOwner, requireStaff } from '../auth.js';

// A "booked" order is one the business expects to fulfil: not cancelled, and either
// paid online or Cash on Delivery. Abandoned online checkouts are excluded.
const BOOKED = `status <> 'cancelled' AND (payment_status = 'paid' OR payment_method = 'cod')`;
const BOOKED_O = `o.status <> 'cancelled' AND (o.payment_status = 'paid' OR o.payment_method = 'cod')`;

const LOW_STOCK = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  // Work queue for the staff dashboard.
  app.get('/api/staff/summary', { preHandler: requireStaff }, async () => {
    const one = (sql: string, ...p: unknown[]) => (db.prepare(sql).get(...p) as { n: number }).n;
    return {
      ordersToProcess: one(`SELECT COUNT(*) AS n FROM orders WHERE status IN ('confirmed', 'packed') AND ${BOOKED}`),
      ordersToday: one(`SELECT COUNT(*) AS n FROM orders WHERE ${BOOKED} AND date(created_at) = date('now')`),
      newInquiries: one(`SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'`),
      lowStock: db.prepare(`SELECT id, name, stock FROM products WHERE active = 1 AND stock IS NOT NULL AND stock <= ? ORDER BY stock`).all(LOW_STOCK),
    };
  });

  app.get('/api/staff/analytics', { preHandler: requireOwner }, async (req) => {
    const { days } = z.object({ days: z.coerce.number().int().min(1).max(730).default(30) }).parse(req.query);
    const since = `datetime('now', '-${days} days')`;
    const prevSince = `datetime('now', '-${days * 2} days')`;

    const period = (from: string, to: string) => db.prepare(`SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue,
      COUNT(DISTINCT customer_phone) AS customers FROM orders WHERE ${BOOKED} AND created_at >= ${from} AND created_at < ${to}`).get() as
      { orders: number; revenue: number; customers: number };
    const current = period(since, `datetime('now', '+1 day')`);
    const previous = period(prevSince, since);

    const collected = (db.prepare(`SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE payment_status = 'paid' AND created_at >= ${since}`).get() as { n: number }).n;
    const codPending = (db.prepare(`SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE payment_method = 'cod' AND payment_status = 'pending' AND status <> 'cancelled'`).get() as { n: number }).n;

    const repeat = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT customer_phone FROM orders WHERE ${BOOKED} GROUP BY customer_phone HAVING COUNT(*) > 1)`).get() as { n: number };
    const allCustomers = db.prepare(`SELECT COUNT(DISTINCT customer_phone) AS n FROM orders WHERE ${BOOKED}`).get() as { n: number };

    const daily = db.prepare(`SELECT date(created_at) AS day, COUNT(*) AS orders, SUM(total) AS revenue FROM orders
      WHERE ${BOOKED} AND created_at >= ${since} GROUP BY day ORDER BY day`).all();

    const topProducts = db.prepare(`SELECT oi.product_id AS productId, oi.name, oi.brand, SUM(oi.quantity) AS units, SUM(oi.quantity * oi.unit_price) AS revenue
      FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE ${BOOKED_O} AND o.created_at >= ${since}
      GROUP BY oi.product_id ORDER BY revenue DESC LIMIT 10`).all();

    const byBrand = db.prepare(`SELECT oi.brand, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE ${BOOKED_O} AND o.created_at >= ${since} GROUP BY oi.brand ORDER BY revenue DESC`).all();

    const byStatus = db.prepare(`SELECT status, COUNT(*) AS count FROM orders WHERE created_at >= ${since} GROUP BY status`).all();
    const byPayment = db.prepare(`SELECT payment_method AS method, COUNT(*) AS count, SUM(total) AS revenue FROM orders WHERE ${BOOKED} AND created_at >= ${since} GROUP BY payment_method`).all();

    const inquiries = db.prepare(`SELECT type, status, COUNT(*) AS count FROM inquiries WHERE created_at >= ${since} GROUP BY type, status`).all();
    const abandoned = (db.prepare(`SELECT COUNT(*) AS n FROM orders WHERE payment_method = 'razorpay' AND payment_status <> 'paid' AND created_at >= ${since}`).get() as { n: number }).n;

    return {
      days,
      revenue: current.revenue,
      revenuePrev: previous.revenue,
      orders: current.orders,
      ordersPrev: previous.orders,
      customers: current.customers,
      avgOrderValue: current.orders ? Math.round(current.revenue / current.orders) : 0,
      collected,
      codPending,
      repeatCustomerRate: allCustomers.n ? Math.round((repeat.n / allCustomers.n) * 100) : 0,
      abandonedCheckouts: abandoned,
      daily,
      topProducts,
      byBrand,
      byStatus,
      byPayment,
      inquiries,
      registeredCustomers: (db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role = 'customer'`).get() as { n: number }).n,
      catalog: db.prepare(`SELECT COUNT(*) AS products, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS outOfStock,
        SUM(CASE WHEN stock IS NOT NULL AND stock > 0 AND stock <= ${LOW_STOCK} THEN 1 ELSE 0 END) AS lowStock FROM products WHERE active = 1`).get(),
    };
  });

  // Coupons are created by the owner only; none exist by default.
  app.get('/api/staff/coupons', { preHandler: requireOwner }, async () =>
    db.prepare(`SELECT code, percent_off AS percentOff, min_order AS minOrder, active FROM coupons ORDER BY code`).all());

  app.post('/api/staff/coupons', { preHandler: requireOwner }, async (req) => {
    const b = z.object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/),
      percentOff: z.number().int().min(1).max(90),
      minOrder: z.number().int().min(0).default(0),
      active: z.boolean().default(true),
    }).parse(req.body);
    db.prepare(`INSERT INTO coupons (code, percent_off, min_order, active) VALUES (?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET percent_off = excluded.percent_off, min_order = excluded.min_order, active = excluded.active`)
      .run(b.code, b.percentOff, b.minOrder, b.active ? 1 : 0);
    return { ok: true };
  });

  app.delete('/api/staff/coupons/:code', { preHandler: requireOwner }, async (req) => {
    db.prepare('DELETE FROM coupons WHERE code = ?').run((req.params as { code: string }).code);
    return { ok: true };
  });
};

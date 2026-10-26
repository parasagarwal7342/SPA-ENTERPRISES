import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { rateLimit, requireStaff } from '../auth.js';
import { notifyBusiness } from '../notify.js';

const inquirySchema = z.object({
  type: z.enum(['bulk', 'dealer', 'contact', 'support']),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, 'Enter a valid phone number'),
  company: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  productId: z.string().trim().max(40).optional().nullable(),
  quantity: z.number().int().min(1).max(100000).optional().nullable(),
  message: z.string().trim().max(2000).default(''),
});

const TYPE_LABEL = { bulk: 'Bulk quote', dealer: 'Dealer enquiry', contact: 'Contact', support: 'Support/warranty' } as const;

export const inquiryRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/inquiries', async (req, reply) => {
    if (!rateLimit(`inquiry:${req.ip}`, 10, 60 * 60 * 1000)) {
      return reply.status(429).send({ error: 'Too many requests. Please call or WhatsApp us instead.' });
    }
    const b = inquirySchema.parse(req.body);
    const info = db.prepare(`INSERT INTO inquiries (type, name, email, phone, company, city, product_id, quantity, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      b.type, b.name, b.email || null, b.phone, b.company || null, b.city || null, b.productId || null, b.quantity ?? null, b.message,
    );
    notifyBusiness(`${TYPE_LABEL[b.type]} from ${b.name}${b.company ? ` (${b.company})` : ''}, ${b.phone}${b.quantity ? `, qty ${b.quantity}` : ''}`, req.log);
    return reply.status(201).send({ id: Number(info.lastInsertRowid) });
  });

  app.get('/api/staff/inquiries', { preHandler: requireStaff }, async (req) => {
    const q = req.query as { status?: string; type?: string };
    const where: string[] = [];
    const params: unknown[] = [];
    if (q.status && q.status !== 'all') { where.push('i.status = ?'); params.push(q.status); }
    if (q.type && q.type !== 'all') { where.push('i.type = ?'); params.push(q.type); }
    return db.prepare(`SELECT i.id, i.type, i.name, i.email, i.phone, i.company, i.city, i.product_id AS productId, p.name AS productName,
      i.quantity, i.message, i.status, i.notes, i.created_at AS createdAt, i.updated_at AS updatedAt
      FROM inquiries i LEFT JOIN products p ON p.id = i.product_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY i.created_at DESC LIMIT 500`).all(...params);
  });

  app.patch('/api/staff/inquiries/:id', { preHandler: requireStaff }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const b = z.object({
      status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
      notes: z.string().trim().max(2000).nullable().optional(),
    }).parse(req.body);
    const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as any;
    if (!row) return reply.status(404).send({ error: 'Enquiry not found.' });
    db.prepare(`UPDATE inquiries SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`).run(
      b.status ?? row.status, b.notes !== undefined ? b.notes : row.notes, id,
    );
    return { ok: true };
  });
};

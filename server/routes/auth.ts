import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db.js';
import { hashPassword, rateLimit, requireOwner, requireRole, signToken, verifyPassword, type Role } from '../auth.js';

const publicUser = (u: { id: number; name: string; email: string; phone: string | null; role: Role }) => ({
  id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/auth/register', async (req, reply) => {
    if (!rateLimit(`register:${req.ip}`, 10, 60 * 60 * 1000)) {
      return reply.status(429).send({ error: 'Too many sign-ups from this network. Try again later.' });
    }
    const body = registerSchema.parse(req.body);
    const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(body.email);
    if (exists) return reply.status(409).send({ error: 'An account with this email already exists. Please sign in.' });

    const info = db.prepare(`INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')`)
      .run(body.name, body.email, body.phone || null, hashPassword(body.password));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as any;
    return { token: signToken(user), user: publicUser(user) };
  });

  app.post('/api/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    if (!rateLimit(`login:${req.ip}:${body.email.toLowerCase()}`, 8, 15 * 60 * 1000)) {
      return reply.status(429).send({ error: 'Too many attempts. Please wait 15 minutes and try again.' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(body.email) as any;
    if (!user || !verifyPassword(body.password, user.password_hash)) {
      return reply.status(401).send({ error: 'Incorrect email or password.' });
    }
    return { token: signToken(user), user: publicUser(user) };
  });

  app.get('/api/auth/me', { preHandler: requireRole() }, async (req) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
    return { user: publicUser(user) };
  });

  app.post('/api/auth/change-password', { preHandler: requireRole() }, async (req, reply) => {
    const body = z.object({ currentPassword: z.string(), newPassword: z.string().min(8).max(128) }).parse(req.body);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!verifyPassword(body.currentPassword, user.password_hash)) {
      return reply.status(400).send({ error: 'Current password is incorrect.' });
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(body.newPassword), user.id);
    return { ok: true };
  });

  // Team management: only the owner can add or remove staff logins.
  app.get('/api/staff/team', { preHandler: requireOwner }, async () => {
    return db.prepare(`SELECT id, name, email, phone, role, created_at AS createdAt FROM users WHERE role IN ('seller', 'owner') ORDER BY role DESC, name`).all();
  });

  app.post('/api/staff/team', { preHandler: requireOwner }, async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(body.email) as { id: number; role: Role } | undefined;
    if (existing) {
      if (existing.role !== 'customer') return reply.status(409).send({ error: 'That person is already on the team.' });
      db.prepare(`UPDATE users SET role = 'seller', name = ?, password_hash = ? WHERE id = ?`).run(body.name, hashPassword(body.password), existing.id);
      return { id: existing.id };
    }
    const info = db.prepare(`INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'seller')`)
      .run(body.name, body.email, body.phone || null, hashPassword(body.password));
    return { id: Number(info.lastInsertRowid) };
  });

  app.delete('/api/staff/team/:id', { preHandler: requireOwner }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (id === req.user!.id) return reply.status(400).send({ error: 'You cannot remove your own owner account.' });
    db.prepare(`UPDATE users SET role = 'customer' WHERE id = ? AND role = 'seller'`).run(id);
    return { ok: true };
  });
};

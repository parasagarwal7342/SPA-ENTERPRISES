import crypto from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './db.js';

export type Role = 'customer' | 'seller' | 'owner';

export interface AuthUser {
  id: number;
  role: Role;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET (min 32 chars) must be set in production.');
  }
  return 'dev-only-insecure-secret-change-me-please-000000';
}

const b64url = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

export function signToken(user: AuthUser) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }));
  const sig = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export function verifyToken(token: string): AuthUser | null {
  const [header, payload, sig] = token.split('.');
  if (!header || !payload || !sig) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    // Re-read the role so a demoted or deleted account loses access immediately.
    const row = db.prepare('SELECT id, role FROM users WHERE id = ?').get(data.sub) as AuthUser | undefined;
    return row ?? null;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Attaches request.user when a valid bearer token is present; never rejects.
export async function attachUser(request: FastifyRequest) {
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    request.user = verifyToken(header.slice(7)) ?? undefined;
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Please sign in to continue.' });
    }
    if (roles.length && !roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'You do not have access to this area.' });
    }
  };
}

export const requireStaff = requireRole('seller', 'owner');
export const requireOwner = requireRole('owner');

// Creates or updates the owner account from OWNER_EMAIL / OWNER_PASSWORD so the
// business can always get into the dashboard after a fresh deploy.
export function ensureOwnerAccount(log: (msg: string) => void) {
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  if (!email || !password) {
    log('OWNER_EMAIL / OWNER_PASSWORD not set: no owner account was created.');
    return;
  }
  const existing = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as
    | { id: number; password_hash: string }
    | undefined;
  if (!existing) {
    db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'owner')`).run(
      process.env.OWNER_NAME || 'SPA Owner', email, hashPassword(password),
    );
    log(`Owner account created for ${email}.`);
  } else {
    db.prepare(`UPDATE users SET role = 'owner' WHERE id = ?`).run(existing.id);
    if (!verifyPassword(password, existing.password_hash)) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), existing.id);
      log(`Owner password for ${email} updated from OWNER_PASSWORD.`);
    }
  }
}

// Small in-memory limiter for login/registration to slow down password guessing.
const attempts = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

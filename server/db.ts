import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// On Railway, mount a volume and point DATA_DIR at it so data survives redeploys.
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'spa.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'owner')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  image TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  mrp INTEGER,
  stock INTEGER, -- NULL = not tracked (always available)
  b2b_price INTEGER,
  b2b_min_qty INTEGER NOT NULL DEFAULT 10,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  shipping_region TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  coupon_code TEXT,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'cod')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  tracking_info TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  image TEXT,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('bulk', 'dealer', 'contact', 'support')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  city TEXT,
  product_id TEXT,
  quantity INTEGER,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY COLLATE NOCASE,
  percent_off INTEGER NOT NULL CHECK (percent_off BETWEEN 1 AND 90),
  min_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
`);

export interface SeedProduct {
  id: string;
  brand: string;
  name: string;
  description: string;
  features: string[];
  image: string;
  images: string[];
  category: string;
  price: number;
  mrp: number | null;
}

export interface ProductRow {
  id: string;
  brand: string;
  name: string;
  description: string;
  features: string;
  image: string;
  images: string;
  category: string;
  price: number;
  mrp: number | null;
  stock: number | null;
  b2b_price: number | null;
  b2b_min_qty: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export const toProduct = (r: ProductRow) => ({
  id: r.id,
  brand: r.brand,
  name: r.name,
  description: r.description,
  features: JSON.parse(r.features) as string[],
  image: r.image,
  images: JSON.parse(r.images) as string[],
  category: r.category,
  price: r.price,
  mrp: r.mrp,
  stock: r.stock,
  b2bPrice: r.b2b_price,
  b2bMinQty: r.b2b_min_qty,
  active: !!r.active,
});

export function seedProducts(products: SeedProduct[]) {
  const count = (db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number }).n;
  if (count > 0) return 0;
  const insert = db.prepare(`INSERT INTO products (id, brand, name, description, features, image, images, category, price, mrp)
    VALUES (@id, @brand, @name, @description, @features, @image, @images, @category, @price, @mrp)`);
  db.transaction(() => {
    for (const p of products) {
      insert.run({ ...p, features: JSON.stringify(p.features), images: JSON.stringify(p.images) });
    }
  })();
  return products.length;
}

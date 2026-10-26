import { db, ProductRow } from './db.js';

export type ShippingRegion = 'delhi' | 'india' | 'global';

const envNum = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && process.env[name] !== '' && process.env[name] !== undefined ? n : fallback;
};

// Shipping rules shown to customers at checkout (whole rupees). Defaults match the
// original storefront; override with env vars without touching code.
export const SHIPPING_RULES = {
  delhi: { label: 'Delhi / NCR', fee: envNum('SHIPPING_FEE_DELHI', 0), freeAbove: 0 },
  india: { label: 'Rest of India', fee: envNum('SHIPPING_FEE_INDIA', 500), freeAbove: envNum('FREE_SHIPPING_ABOVE', 4999) },
  global: { label: 'International', fee: envNum('SHIPPING_FEE_GLOBAL', 2500), freeAbove: 0 },
} as const;

export interface CartLine {
  productId: string;
  quantity: number;
}

export class PricingError extends Error {}

export function priceCart(lines: CartLine[], region: ShippingRegion, couponCode?: string | null) {
  if (!lines.length) throw new PricingError('Your cart is empty.');

  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity);

  const items = [...merged.entries()].map(([productId, quantity]) => {
    const p = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(productId) as ProductRow | undefined;
    if (!p) throw new PricingError('One of the items in your cart is no longer available.');
    if (p.stock !== null && p.stock < quantity) {
      throw new PricingError(p.stock === 0 ? `${p.name} is out of stock.` : `Only ${p.stock} left of ${p.name}.`);
    }
    return { productId, name: p.name, brand: p.brand, image: p.image, unitPrice: p.price, quantity, lineTotal: p.price * quantity };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const c = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(couponCode.trim()) as
      | { code: string; percent_off: number; min_order: number }
      | undefined;
    if (!c) throw new PricingError('That coupon code is not valid.');
    if (subtotal < c.min_order) throw new PricingError(`Coupon ${c.code} needs a minimum order of ₹${c.min_order}.`);
    discount = Math.floor((subtotal * c.percent_off) / 100);
    appliedCoupon = c.code;
  }

  const rule = SHIPPING_RULES[region];
  const shippingFee = rule.freeAbove && subtotal - discount >= rule.freeAbove ? 0 : rule.fee;
  const total = subtotal - discount + shippingFee;

  return { items, subtotal, discount, couponCode: appliedCoupon, shippingFee, total };
}

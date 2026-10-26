import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts } from './ProductContext';
import type { Product } from './types';

export interface CartLine { productId: string; quantity: number }
export interface CartRow { product: Product; quantity: number }

interface CartContextType {
  lines: CartLine[];
  rows: CartRow[];
  count: number;
  subtotal: number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  lastAdded: { id: string; at: number } | null;
}

const KEY = 'spa_cart_v2';
const CartContext = createContext<CartContextType | undefined>(undefined);

const load = (): CartLine[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((l) => typeof l.productId === 'string' && l.quantity > 0) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getProduct, products } = useProducts();
  const [lines, setLines] = useState<CartLine[]>(load);
  const [lastAdded, setLastAdded] = useState<{ id: string; at: number } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage unavailable */ }
  }, [lines]);

  // Keep only products that still exist once the catalog has loaded.
  const rows = useMemo(() => lines.flatMap((l) => {
    const product = getProduct(l.productId);
    return product ? [{ product, quantity: l.quantity }] : [];
  }), [lines, getProduct, products]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: CartContextType = {
    lines,
    rows,
    count: rows.reduce((s, r) => s + r.quantity, 0),
    subtotal: rows.reduce((s, r) => s + r.quantity * r.product.price, 0),
    lastAdded,
    add: (productId, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        return existing
          ? prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(l.quantity + quantity, 500) } : l))
          : [...prev, { productId, quantity }];
      });
      setLastAdded({ id: productId, at: Date.now() });
    },
    setQuantity: (productId, quantity) =>
      setLines((prev) => (quantity <= 0 ? prev.filter((l) => l.productId !== productId) : prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, 500) } : l)))),
    remove: (productId) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
    clear: () => setLines([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

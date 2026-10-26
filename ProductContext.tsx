import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './lib/api';
import type { Product, SiteConfig } from './types';

const DEFAULT_CONFIG: SiteConfig = {
  paymentMethods: ['cod'],
  razorpayKeyId: null,
  shipping: {
    delhi: { label: 'Delhi / NCR', fee: 0, freeAbove: 0 },
    india: { label: 'Rest of India', fee: 500, freeAbove: 4999 },
    global: { label: 'International', fee: 2500, freeAbove: 0 },
  },
  whatsappNumber: '919312277087',
  aiEnabled: false,
};

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  config: SiteConfig;
  refreshCatalog: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  const refreshCatalog = useCallback(async () => {
    try {
      setProducts(await api<Product[]>('/products'));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
    api<SiteConfig>('/config').then(setConfig).catch(() => { /* keep defaults */ });
  }, [refreshCatalog]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  return (
    <ProductContext.Provider value={{ products, loading, error, config, refreshCatalog, getProduct: (id) => byId.get(id) }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

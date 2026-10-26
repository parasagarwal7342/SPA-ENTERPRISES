import React, { useMemo } from 'react';
import { Search, ShoppingCart, SlidersHorizontal, Check, X } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { Link, navigate, useDocumentMeta, useLocation } from '../lib/router';
import { inr, percentOff, titleCase } from '../lib/format';
import { Spinner } from './ui';
import type { Product } from '../types';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'discount', label: 'Biggest discount' },
] as const;

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { add, lines } = useCart();
  const off = percentOff(product.price, product.mrp);
  const out = product.stock === 0;
  const inCart = lines.some((l) => l.productId === product.id);
  const href = `/products/${encodeURIComponent(product.id)}`;

  return (
    <article className="group card overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 transition">
      <Link to={href} className="relative block aspect-square bg-slate-50 p-4">
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
        {off > 0 && <span className="absolute top-3 left-3 bg-green-600 text-white text-[11px] font-bold px-2 py-1 rounded-md">{off}% OFF</span>}
        {out && <span className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-semibold text-slate-700">Out of stock</span>}
        {!out && product.stock !== null && product.stock <= 5 && (
          <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-1 rounded-md">Only {product.stock} left</span>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-1">{product.brand}</p>
        <Link to={href} className="text-sm font-semibold text-slate-800 line-clamp-2 min-h-[2.5rem] hover:text-blue-600">{titleCase(product.name)}</Link>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <span className="text-lg font-bold text-slate-900">{inr(product.price)}</span>
            {off > 0 && <span className="ml-2 text-xs text-slate-400 line-through">{inr(product.mrp)}</span>}
          </div>
          <button
            onClick={() => add(product.id)}
            disabled={out}
            aria-label={`Add ${product.name} to cart`}
            className={`p-2.5 rounded-xl border transition disabled:opacity-40 ${inCart ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
          >
            {inCart ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
};

const Products: React.FC = () => {
  const { products, loading, error, refreshCatalog } = useProducts();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const q = params.get('q') ?? '';
  const brand = params.get('brand') ?? 'All';
  const category = params.get('category') ?? 'All';
  const sort = params.get('sort') ?? 'featured';
  const inStock = params.get('instock') === '1';

  useDocumentMeta(
    brand !== 'All' ? `${brand} ${category !== 'All' ? titleCase(category) : 'Products'}` : 'Shop All Products',
    'Buy original National Geographic bags, backpacks and suitcases and Shraddha brass jewellery from the authorised distributor in Delhi.',
  );

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(search);
    if (value === null || value === '' || value === 'All' || (key === 'sort' && value === 'featured')) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    navigate(`/products${qs ? `?${qs}` : ''}`, { replace: true });
  };

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const categories = useMemo(
    () => [...new Set(products.filter((p) => brand === 'All' || p.brand === brand).map((p) => p.category))].sort(),
    [products, brand],
  );

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    const list = products.filter((p) =>
      (brand === 'All' || p.brand === brand) &&
      (category === 'All' || p.category === category) &&
      (!inStock || p.stock !== 0) &&
      (!needle || [p.name, p.category, p.id, p.brand, p.description].some((f) => f.toLowerCase().includes(needle))),
    );
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'discount') sorted.sort((a, b) => percentOff(b.price, b.mrp) - percentOff(a.price, a.mrp));
    else sorted.sort((a, b) => Number(a.stock === 0) - Number(b.stock === 0));
    return sorted;
  }, [products, brand, category, inStock, q, sort]);

  const activeFilters = [
    q && { label: `"${q}"`, clear: () => setParam('q', null) },
    brand !== 'All' && { label: brand, clear: () => setParam('brand', null) },
    category !== 'All' && { label: titleCase(category), clear: () => setParam('category', null) },
    inStock && { label: 'In stock', clear: () => setParam('instock', null) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Shop</h1>
          <p className="text-sm text-slate-500 mt-1">100% original products, shipped from our Delhi warehouse.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative md:hidden flex-grow">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && setParam('q', (e.target as HTMLInputElement).value.trim())} placeholder="Search…" className="input pl-9 py-2.5" aria-label="Search products" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Sort</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input py-2.5 w-auto">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside className="lg:w-60 flex-shrink-0">
          <div className="card p-4 lg:p-5 lg:sticky lg:top-28 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</h2>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Brand</p>
              <div className="flex lg:flex-col flex-wrap gap-1.5">
                {['All', ...brands].map((b) => (
                  <button key={b} onClick={() => { setParam('brand', b); }} className={`text-left text-sm px-3 py-2 rounded-lg transition ${brand === b ? 'bg-blue-600 text-white' : 'bg-slate-50 lg:bg-transparent text-slate-700 hover:bg-slate-100'}`}>
                    {b === 'All' ? 'All brands' : b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Category</p>
              <select value={category} onChange={(e) => setParam('category', e.target.value)} className="input py-2.5">
                <option value="All">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={(e) => setParam('instock', e.target.checked ? '1' : null)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              In stock only
            </label>
            <div className="hidden lg:block rounded-xl bg-slate-900 text-white p-4">
              <p className="text-sm font-semibold mb-1">Buying 10 or more?</p>
              <p className="text-xs text-slate-300 mb-3">Get wholesale pricing for corporate gifting, retail and resale.</p>
              <Link to="/bulk-order" className="text-xs font-semibold text-blue-300 hover:text-white">Request a bulk quote →</Link>
            </div>
          </div>
        </aside>

        <section className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-4 min-h-8">
            <span className="text-sm text-slate-500">{loading ? 'Loading…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}</span>
            {activeFilters.map((f) => (
              <button key={f.label} onClick={f.clear} className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100">
                {f.label} <X size={12} />
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-24 flex justify-center"><Spinner /></div>
          ) : error && !products.length ? (
            <div className="card p-10 text-center">
              <p className="text-slate-700 font-medium mb-2">We couldn't load the catalogue.</p>
              <p className="text-sm text-slate-500 mb-6">{error}</p>
              <button onClick={refreshCatalog} className="btn-primary">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-slate-700 font-medium mb-2">No products match these filters.</p>
              <button onClick={() => navigate('/products', { replace: true })} className="text-sm font-semibold text-blue-600">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;

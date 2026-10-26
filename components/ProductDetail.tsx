import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Zap, ShieldCheck, Truck, BadgeCheck, MessageCircle, Minus, Plus, Building2, ChevronLeft } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { useCart } from '../CartContext';
import { Link, navigate, useDocumentMeta } from '../lib/router';
import { inr, percentOff, titleCase, whatsappLink } from '../lib/format';
import { Spinner } from './ui';
import { ProductCard } from './Products';

const ProductDetail: React.FC<{ id: string }> = ({ id }) => {
  const { getProduct, products, loading, config } = useProducts();
  const { add } = useCart();
  const product = getProduct(id);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { setActiveImage(null); setQty(1); }, [id]);

  useDocumentMeta(product ? titleCase(product.name) : 'Product', product?.description.slice(0, 155));

  // Structured data so search engines can show price and availability.
  useEffect(() => {
    if (!product) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.id,
      brand: { '@type': 'Brand', name: product.brand },
      image: [product.image, ...product.images],
      description: product.description,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price,
        availability: product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        url: window.location.href,
        seller: { '@type': 'Organization', name: 'SPA Enterprises' },
      },
    });
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [product]);

  const related = useMemo(
    () => (product ? products.filter((p) => p.id !== product.id && p.category === product.category && p.stock !== 0).slice(0, 4) : []),
    [products, product],
  );

  if (loading) return <div className="pt-40 flex justify-center"><Spinner /></div>;
  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center px-4">
        <h1 className="text-2xl font-bold mb-3">Product not found</h1>
        <p className="text-slate-500 mb-6">It may have been removed or the link is incorrect.</p>
        <Link to="/products" className="btn-primary">Browse all products</Link>
      </div>
    );
  }

  const off = percentOff(product.price, product.mrp);
  const out = product.stock === 0;
  const maxQty = product.stock ?? 50;
  const gallery = [product.image, ...product.images.filter(Boolean)];
  const shareText = `Hi SPA Enterprise, I'm interested in ${titleCase(product.name)} (${product.id}) – ${inr(product.price)}. ${window.location.href}`;
  const india = config.shipping.india;

  const handleAdd = () => {
    add(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-20">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-5">
        <ChevronLeft size={16} /> All products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div className="card aspect-square p-6 sm:p-10 bg-white flex items-center justify-center">
            <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-contain" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {gallery.map((img) => (
                <button key={img} onClick={() => setActiveImage(img)} className={`w-20 h-20 flex-shrink-0 card p-1.5 ${((activeImage || product.image) === img) ? 'border-blue-600 ring-2 ring-blue-100' : ''}`}>
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">{product.brand} · {titleCase(product.category)}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-2">{titleCase(product.name)}</h1>
          <p className="text-xs text-slate-400 mb-5">SKU: {product.id}</p>

          <div className="flex items-baseline flex-wrap gap-3 mb-1">
            <span className="text-3xl font-bold text-slate-900">{inr(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{inr(product.mrp)}</span>
                <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{off}% off</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-6">Inclusive of all taxes</p>

          {out ? (
            <p className="text-sm font-semibold text-red-600 mb-4">Currently out of stock – message us on WhatsApp to be notified.</p>
          ) : product.stock !== null && product.stock <= 5 ? (
            <p className="text-sm font-semibold text-amber-700 mb-4">Hurry, only {product.stock} left in stock.</p>
          ) : (
            <p className="text-sm font-semibold text-green-700 mb-4">In stock · ships from Delhi</p>
          )}

          {!out && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-600">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 text-slate-500 hover:text-slate-900" aria-label="Decrease quantity"><Minus size={16} /></button>
                <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
                <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="p-2.5 text-slate-500 hover:text-slate-900" aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <button onClick={handleAdd} disabled={out} className="btn-outline py-3.5 border-blue-600 text-blue-700">
              <ShoppingCart size={18} /> {added ? 'Added to cart' : 'Add to cart'}
            </button>
            <button onClick={() => { add(product.id, qty); navigate('/cart'); }} disabled={out} className="btn-primary py-3.5">
              <Zap size={18} /> Buy now
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            <a href={whatsappLink(shareText, config.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline text-green-700">
              <MessageCircle size={18} /> Ask on WhatsApp
            </a>
            <Link to={`/bulk-order?product=${encodeURIComponent(product.id)}`} className="btn-outline">
              <Building2 size={18} /> Bulk / corporate quote
            </Link>
          </div>

          <ul className="grid sm:grid-cols-3 gap-3 mb-8 text-xs text-slate-600">
            <li className="flex items-center gap-2 card px-3 py-2.5"><BadgeCheck size={18} className="text-blue-600 flex-shrink-0" /> Authorised distributor</li>
            <li className="flex items-center gap-2 card px-3 py-2.5"><Truck size={18} className="text-blue-600 flex-shrink-0" /> Free delivery above {inr(india.freeAbove)}</li>
            <li className="flex items-center gap-2 card px-3 py-2.5"><ShieldCheck size={18} className="text-blue-600 flex-shrink-0" /> Secure payment{config.paymentMethods.includes('cod') ? ' / COD' : ''}</li>
          </ul>

          {product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Highlights</h2>
              <ul className="grid gap-2">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-slate-600"><span className="text-blue-600">•</span>{f}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900 mb-5">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

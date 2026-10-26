import React, { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, ShieldCheck, CheckCircle2, ShoppingBag, CreditCard, Banknote, MessageCircle, Tag } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useProducts } from '../ProductContext';
import { api, ApiError } from '../lib/api';
import { Link, useDocumentMeta } from '../lib/router';
import { inr, titleCase, whatsappLink } from '../lib/format';
import { ErrorNote, Field, Spinner } from './ui';
import type { Order, ShippingRegion } from '../types';

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }
}

interface Quote { subtotal: number; discount: number; couponCode: string | null; shippingFee: number; total: number }

const loadRazorpay = () => new Promise<void>((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve();
  s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'));
  document.body.appendChild(s);
});

const FORM_KEY = 'spa_checkout_details';

const Checkout: React.FC = () => {
  useDocumentMeta('Cart & Checkout');
  const { rows, lines, setQuantity, remove, clear, subtotal } = useCart();
  const { user } = useAuth();
  const { config, loading: catalogLoading, refreshCatalog } = useProducts();

  const [form, setForm] = useState(() => {
    try { return { name: '', email: '', phone: '', address: '', city: '', pincode: '', ...JSON.parse(localStorage.getItem(FORM_KEY) || '{}') }; }
    catch { return { name: '', email: '', phone: '', address: '', city: '', pincode: '' }; }
  });
  const [region, setRegion] = useState<ShippingRegion>('india');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [payment, setPayment] = useState<'razorpay' | 'cod'>('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    if (user) setForm((f: typeof form) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone || '' }));
  }, [user]);

  useEffect(() => {
    if (!config.paymentMethods.includes(payment) && config.paymentMethods.length) setPayment(config.paymentMethods[0]);
  }, [config.paymentMethods, payment]);

  useEffect(() => {
    if (region === 'global' && payment === 'cod' && config.paymentMethods.includes('razorpay')) setPayment('razorpay');
  }, [region, payment, config.paymentMethods]);

  // Server-side price check whenever the cart, region or coupon changes.
  const cartKey = JSON.stringify(lines);
  useEffect(() => {
    if (!lines.length) { setQuote(null); return; }
    const t = setTimeout(() => {
      api<Quote>('/orders/quote', { body: { items: lines, shippingRegion: region, couponCode: coupon } })
        .then((q) => { setQuote(q); setQuoteError(null); })
        .catch((e: ApiError) => {
          setQuoteError(e.message);
          if (coupon && /coupon/i.test(e.message)) setCoupon(null);
        });
    }, 250);
    return () => clearTimeout(t);
  }, [cartKey, region, coupon]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const finish = (order: Order) => {
    setPlaced(order);
    clear();
    refreshCatalog();
    window.scrollTo(0, 0);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try { localStorage.setItem(FORM_KEY, JSON.stringify(form)); } catch { /* ignore */ }
    try {
      const res = await api<{ order: Order; razorpay?: { keyId: string; orderId: string; amount: number; currency: string } }>('/orders', {
        body: { items: lines, shippingRegion: region, couponCode: coupon, paymentMethod: payment, customer: form },
      });
      if (!res.razorpay) {
        finish(res.order);
        return;
      }
      await loadRazorpay();
      const { order, razorpay } = res;
      const rzp = new window.Razorpay!({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: 'SPA Enterprise',
        description: `Order ${order.orderNumber}`,
        image: `${window.location.origin}/logo.png`,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { order_number: order.orderNumber },
        theme: { color: '#2563EB' },
        handler: async (response: Record<string, string>) => {
          try {
            const verified = await api<{ order: Order }>(`/orders/${order.orderNumber}/verify-payment`, { body: response });
            finish(verified.order);
          } catch (err) {
            setError(`${(err as Error).message} Your order number is ${order.orderNumber}.`);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError('Payment was not completed. You can try again or choose Cash on Delivery.');
            api(`/orders/${order.orderNumber}/abandon`, { body: { razorpayOrderId: razorpay.orderId } }).catch(() => {});
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (placed) {
    const msg = `Hi SPA Enterprise, I just placed order ${placed.orderNumber} for ${inr(placed.total)}.`;
    return (
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={44} /></div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank you, {placed.customer.name.split(' ')[0]}!</h1>
        <p className="text-slate-600 mb-1">Your order <span className="font-bold text-slate-900">{placed.orderNumber}</span> has been placed.</p>
        <p className="text-sm text-slate-500 mb-8">
          {placed.paymentMethod === 'cod'
            ? `Please keep ${inr(placed.total)} ready for Cash on Delivery. We'll call you on ${placed.customer.phone} to confirm.`
            : `Payment of ${inr(placed.total)} received. We'll keep you updated on ${placed.customer.phone}.`}
        </p>
        <div className="card p-5 text-left mb-8">
          {placed.items.map((i) => (
            <div key={i.productId} className="flex justify-between gap-4 text-sm py-1.5">
              <span className="text-slate-700">{titleCase(i.name)} × {i.quantity}</span>
              <span className="font-semibold">{inr(i.unitPrice * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-100 mt-3 pt-3 font-bold"><span>Total</span><span>{inr(placed.total)}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/track?order=${placed.orderNumber}`} className="btn-dark">Track this order</Link>
          <a href={whatsappLink(msg, config.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline text-green-700"><MessageCircle size={18} /> Confirm on WhatsApp</a>
          <Link to="/products" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (catalogLoading) return <div className="pt-40 flex justify-center"><Spinner /></div>;

  if (!rows.length) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 mb-8">Explore original National Geographic bags and Shraddha jewellery.</p>
        <Link to="/products" className="btn-primary">Start shopping</Link>
      </div>
    );
  }

  const rules = config.shipping;
  const india = rules.india;
  const toFree = region === 'india' && india.freeAbove > 0 ? india.freeAbove - subtotal : 0;
  const codAllowed = config.paymentMethods.includes('cod') && region !== 'global';
  const noPayment = !config.paymentMethods.includes('razorpay') && !codAllowed;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
        <div className="space-y-6">
          <section className="card divide-y divide-slate-100">
            {rows.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 p-4">
                <Link to={`/products/${encodeURIComponent(product.id)}`} className="w-20 h-20 flex-shrink-0 bg-slate-50 rounded-xl p-2">
                  <img src={product.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </Link>
                <div className="flex-grow min-w-0">
                  <p className="text-[11px] font-semibold text-blue-600 uppercase">{product.brand}</p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">{titleCase(product.name)}</p>
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} className="p-1.5 text-slate-500" aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(product.id, Math.min(quantity + 1, product.stock ?? 500))} className="p-1.5 text-slate-500" aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <span className="font-bold text-slate-900">{inr(product.price * quantity)}</span>
                    <button type="button" onClick={() => remove(product.id)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Remove"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Delivery details</h2>
            {!user && <p className="text-sm text-slate-500 mb-4">No account needed. <Link to="/login?next=/cart" className="text-blue-600 font-semibold">Sign in</Link> to save your orders.</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name"><input required minLength={2} value={form.name} onChange={update('name')} className="input" autoComplete="name" /></Field>
              <Field label="Mobile number"><input required type="tel" value={form.phone} onChange={update('phone')} className="input" autoComplete="tel" placeholder="98XXXXXXXX" pattern="[+0-9][0-9 \-]{7,15}" /></Field>
              <Field label="Email" className="sm:col-span-2"><input required type="email" value={form.email} onChange={update('email')} className="input" autoComplete="email" /></Field>
              <Field label="Address (house no., street, area)" className="sm:col-span-2"><textarea required minLength={8} rows={2} value={form.address} onChange={update('address')} className="input resize-none" autoComplete="street-address" /></Field>
              <Field label="City"><input required value={form.city} onChange={update('city')} className="input" autoComplete="address-level2" /></Field>
              <Field label="PIN code"><input required value={form.pincode} onChange={update('pincode')} className="input" autoComplete="postal-code" inputMode="numeric" /></Field>
              <Field label="Delivery area" className="sm:col-span-2">
                <select value={region} onChange={(e) => setRegion(e.target.value as ShippingRegion)} className="input">
                  <option value="delhi">{rules.delhi.label} – {rules.delhi.fee ? inr(rules.delhi.fee) : 'free delivery'}</option>
                  <option value="india">{india.label} – {inr(india.fee)}{india.freeAbove ? `, free above ${inr(india.freeAbove)}` : ''}</option>
                  <option value="global">{rules.global.label} – {inr(rules.global.fee)}</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Payment</h2>
            {noPayment ? (
              <ErrorNote>Online ordering is paused right now. Please WhatsApp us at +{config.whatsappNumber} to order.</ErrorNote>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {config.paymentMethods.includes('razorpay') && (
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${payment === 'razorpay' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
                    <input type="radio" name="payment" checked={payment === 'razorpay'} onChange={() => setPayment('razorpay')} className="mt-1" />
                    <span><span className="flex items-center gap-2 font-semibold text-sm"><CreditCard size={16} /> Pay online</span><span className="text-xs text-slate-500">UPI, cards, net banking, wallets</span></span>
                  </label>
                )}
                {config.paymentMethods.includes('cod') && (
                  <label className={`flex items-start gap-3 p-4 rounded-xl border ${!codAllowed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${payment === 'cod' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
                    <input type="radio" name="payment" disabled={!codAllowed} checked={payment === 'cod'} onChange={() => setPayment('cod')} className="mt-1" />
                    <span><span className="flex items-center gap-2 font-semibold text-sm"><Banknote size={16} /> Cash on Delivery</span><span className="text-xs text-slate-500">{codAllowed ? 'Pay when your order arrives' : 'Available within India only'}</span></span>
                  </label>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="card p-5 sm:p-6 lg:sticky lg:top-28 space-y-4">
          <h2 className="font-semibold text-slate-900">Order summary</h2>
          {toFree > 0 && (
            <p className="text-xs bg-blue-50 text-blue-800 rounded-lg px-3 py-2">Add {inr(toFree)} more for free delivery.</p>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{inr(quote?.subtotal ?? subtotal)}</span></div>
            {!!quote?.discount && <div className="flex justify-between text-green-700"><span>Coupon {quote.couponCode}</span><span>−{inr(quote.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>{quote ? (quote.shippingFee ? inr(quote.shippingFee) : 'Free') : '…'}</span></div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Coupon code" className="input pl-8 py-2.5" aria-label="Coupon code" />
            </div>
            <button type="button" onClick={() => setCoupon(couponInput.trim() || null)} className="btn-outline px-4 py-2.5">Apply</button>
          </div>
          <ErrorNote>{quoteError}</ErrorNote>
          <div className="flex justify-between items-baseline border-t border-slate-100 pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold">{quote ? inr(quote.total) : '…'}</span>
          </div>
          <p className="text-[11px] text-slate-500 -mt-2">Inclusive of GST</p>
          <ErrorNote>{error}</ErrorNote>
          <button type="submit" disabled={submitting || !quote || !!quoteError || noPayment} className="btn-primary w-full py-4 text-base">
            {submitting ? <Spinner size={18} className="text-white" /> : payment === 'cod' ? 'Place order' : `Pay ${quote ? inr(quote.total) : ''}`}
          </button>
          <p className="flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck size={14} className="text-green-600" /> Secure checkout{config.paymentMethods.includes('razorpay') ? ' by Razorpay' : ''}</p>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;

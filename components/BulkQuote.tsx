import React, { useState } from 'react';
import { Building2, Gift, Store, CheckCircle2, MessageCircle } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { api } from '../lib/api';
import { Link, useDocumentMeta, useLocation } from '../lib/router';
import { inr, titleCase, whatsappLink } from '../lib/format';
import { ErrorNote, Field, Spinner } from './ui';

export const InquiryForm: React.FC<{ defaultType?: 'bulk' | 'dealer' | 'contact' | 'support'; productId?: string; compact?: boolean }> = ({ defaultType = 'bulk', productId = '', compact }) => {
  const { products, config } = useProducts();
  const [form, setForm] = useState({ type: defaultType, name: '', phone: '', email: '', company: '', city: '', productId, quantity: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const isTrade = form.type === 'bulk' || form.type === 'dealer';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/inquiries', {
        body: {
          ...form,
          productId: form.productId || null,
          quantity: form.quantity ? Number(form.quantity) : null,
          email: form.email || undefined,
        },
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-green-600 mb-3" />
        <h3 className="text-lg font-bold mb-1">Thanks, {form.name.split(' ')[0]}! We've received your request.</h3>
        <p className="text-sm text-slate-500 mb-5">Our team will call you on {form.phone}, usually within one working day.</p>
        <a href={whatsappLink(`Hi SPA Enterprise, I just sent a ${isTrade ? 'bulk quote' : 'message'} request (${form.name}).`, config.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline text-green-700">
          <MessageCircle size={18} /> Need it faster? WhatsApp us
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
      {!compact && (
        <Field label="I'm interested in" className="sm:col-span-2">
          <select value={form.type} onChange={set('type')} className="input">
            <option value="bulk">Bulk order / corporate gifting</option>
            <option value="dealer">Becoming a dealer / retailer</option>
            <option value="contact">General question</option>
            <option value="support">Warranty / after-sales support</option>
          </select>
        </Field>
      )}
      <Field label="Your name"><input required minLength={2} value={form.name} onChange={set('name')} className="input" autoComplete="name" /></Field>
      <Field label="Mobile number"><input required type="tel" value={form.phone} onChange={set('phone')} className="input" autoComplete="tel" pattern="[+0-9][0-9 \-]{7,15}" /></Field>
      <Field label="Email (optional)"><input type="email" value={form.email} onChange={set('email')} className="input" autoComplete="email" /></Field>
      {isTrade ? (
        <Field label="Company / shop name"><input value={form.company} onChange={set('company')} className="input" autoComplete="organization" /></Field>
      ) : (
        <Field label="City"><input value={form.city} onChange={set('city')} className="input" /></Field>
      )}
      {isTrade && (
        <>
          <Field label="Product (optional)">
            <select value={form.productId} onChange={set('productId')} className="input">
              <option value="">Mixed / not sure yet</option>
              {products.map((p) => <option key={p.id} value={p.id}>{titleCase(p.name).slice(0, 60)} – {inr(p.price)}</option>)}
            </select>
          </Field>
          <Field label="Approx. quantity"><input type="number" min={1} value={form.quantity} onChange={set('quantity')} className="input" placeholder="e.g. 50" /></Field>
          <Field label="City"><input value={form.city} onChange={set('city')} className="input" /></Field>
        </>
      )}
      <Field label="Message" className="sm:col-span-2">
        <textarea rows={3} value={form.message} onChange={set('message')} className="input resize-none" placeholder={isTrade ? 'Delivery date, branding/logo needs, budget…' : 'How can we help?'} />
      </Field>
      <div className="sm:col-span-2"><ErrorNote>{error}</ErrorNote></div>
      <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 py-3.5">
        {busy ? <Spinner size={18} className="text-white" /> : isTrade ? 'Get my quote' : 'Send message'}
      </button>
    </form>
  );
};

const BulkQuote: React.FC = () => {
  useDocumentMeta('Bulk Orders & Corporate Gifting', 'Wholesale prices on National Geographic bags and Shraddha brass jewellery for corporate gifts, retailers and resellers. Get a quote from SPA Enterprise, Delhi.');
  const { search } = useLocation();
  const productId = new URLSearchParams(search).get('product') ?? '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 grid lg:grid-cols-[1fr_1.2fr] gap-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Bulk orders & corporate gifting</h1>
        <p className="text-slate-600 mb-8">As an authorised distributor we supply original National Geographic and Shraddha products at wholesale prices for businesses, events and retailers across India.</p>
        <ul className="space-y-5">
          {[
            { icon: Gift, t: 'Corporate & festive gifting', d: 'Diwali, onboarding kits, client gifts and events.' },
            { icon: Store, t: 'Retailers & resellers', d: 'Stock original products for your shop or online store.' },
            { icon: Building2, t: 'Institutions', d: 'Schools, travel companies and loyalty programmes.' },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex gap-4">
              <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><Icon size={20} /></span>
              <span><span className="block font-semibold text-slate-900">{t}</span><span className="text-sm text-slate-500">{d}</span></span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 mt-8">Prefer to talk? Call <a href="tel:+919312277087" className="font-semibold text-slate-900">+91 93122 77087</a> or browse the <Link to="/catalog" className="text-blue-600 font-semibold">printable catalogue</Link>.</p>
      </div>
      <InquiryForm defaultType="bulk" productId={productId} />
    </div>
  );
};

export default BulkQuote;

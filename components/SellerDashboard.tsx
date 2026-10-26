import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Package, ShoppingCart, Users, Share2, LogOut, Search, Plus, Edit, Trash2, X, Phone, MessageCircle, ExternalLink,
  RefreshCw, AlertTriangle, Briefcase, FileText, Home,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useProducts } from '../ProductContext';
import { api } from '../lib/api';
import { Link, navigate, useDocumentMeta } from '../lib/router';
import { formatDate, inr, titleCase, whatsappLink } from '../lib/format';
import { AutoPostHub } from './AutoPost';
import { ErrorNote, Field, ORDER_STATUS_LABEL, OrderStatusBadge, PaymentBadge, Spinner } from './ui';
import type { Inquiry, Order, OrderStatus, Product } from '../types';

type Tab = 'orders' | 'products' | 'leads' | 'social';

interface Summary { ordersToProcess: number; ordersToday: number; newInquiries: number; lowStock: { id: string; name: string; stock: number }[] }

const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};

// ---------------- Orders ----------------

const ORDER_FILTERS: (OrderStatus | 'all')[] = ['all', 'confirmed', 'packed', 'shipped', 'delivered', 'pending', 'cancelled'];

const OrderRow: React.FC<{ order: Order; onChange: (o: Order) => void }> = ({ order, onChange }) => {
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState(order.trackingInfo ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await api<Order>(`/staff/orders/${order.id}`, { method: 'PATCH', body }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const c = order.customer;
  const statusMsg = `Hi ${c.name.split(' ')[0]}, your SPA Enterprise order ${order.orderNumber} is now ${ORDER_STATUS_LABEL[order.status].toLowerCase()}.${order.trackingInfo ? ` Tracking: ${order.trackingInfo}.` : ''} Track it at ${window.location.origin}/track?order=${order.orderNumber}`;

  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 grid grid-cols-2 sm:grid-cols-[1.3fr_1.4fr_auto_auto] gap-x-4 gap-y-2 items-center">
        <div>
          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right sm:text-left">
          <p className="text-sm font-medium text-slate-800">{c.name}</p>
          <p className="text-xs text-slate-500">{c.city} · {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
        </div>
        <div className="flex gap-1.5 flex-wrap"><OrderStatusBadge status={order.status} /><PaymentBadge method={order.paymentMethod} status={order.paymentStatus} /></div>
        <p className="font-bold text-right">{inr(order.total)}</p>
      </button>
      {open && (
        <div className="border-t border-slate-100 p-4 grid lg:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">{c.name}</p>
              <p className="text-slate-600">{c.address}, {c.city} – {c.pincode}</p>
              <p className="text-slate-600">{c.phone} · {c.email}</p>
              <p className="text-xs text-slate-400 mt-1">Delivery: {order.shippingRegion}{order.couponCode ? ` · Coupon ${order.couponCode}` : ''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${c.phone}`} className="btn-outline px-3 py-2"><Phone size={15} /> Call</a>
              <a href={whatsappLink(statusMsg, waNumber(c.phone))} target="_blank" rel="noopener noreferrer" className="btn-outline px-3 py-2 text-green-700"><MessageCircle size={15} /> Send status on WhatsApp</a>
            </div>
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {order.items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-3 px-3 py-2">
                  <span>{titleCase(i.name)} <span className="text-slate-400">({i.productId}) × {i.quantity}</span></span>
                  <span className="font-semibold whitespace-nowrap">{inr(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between px-3 py-2 text-slate-500"><span>Delivery{order.discount ? ` / discount −${inr(order.discount)}` : ''}</span><span>{inr(order.shippingFee)}</span></li>
            </ul>
            {order.notes && <p className="text-xs bg-amber-50 text-amber-800 rounded-lg p-2">Customer note: {order.notes}</p>}
          </div>
          <div className="space-y-4">
            <Field label="Order status">
              <select value={order.status} disabled={busy} onChange={(e) => {
                if (e.target.value === 'cancelled' && !confirm('Cancel this order? Reserved stock will be returned.')) return;
                patch({ status: e.target.value });
              }} className="input">
                {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
              </select>
            </Field>
            <Field label="Courier & tracking number" hint="Shown to the customer on the tracking page">
              <div className="flex gap-2">
                <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. Delhivery 1234567890" className="input" />
                <button disabled={busy || tracking === (order.trackingInfo ?? '')} onClick={() => patch({ trackingInfo: tracking || null, ...(tracking && order.status !== 'delivered' ? { status: 'shipped' } : {}) })} className="btn-dark px-4">Save</button>
              </div>
            </Field>
            {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
              <button disabled={busy} onClick={() => patch({ paymentStatus: 'paid', ...(order.status !== 'delivered' ? { status: 'delivered' } : {}) })} className="btn-outline w-full text-green-700">
                Mark cash collected & delivered
              </button>
            )}
            <ErrorNote>{error}</ErrorNote>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersTab: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const [status, setStatus] = useState<OrderStatus | 'all'>('confirmed');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Order[]>('/staff/orders', { query: { status, search } }).then(setOrders).catch((e) => setError(e.message));
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {ORDER_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>
              {s === 'all' ? 'All' : s === 'confirmed' ? 'To pack' : ORDER_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no., name, phone…" className="input pl-9 py-2.5" />
        </div>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {!orders ? <div className="py-10 flex justify-center"><Spinner /></div> : orders.length === 0 ? (
        <p className="card p-10 text-center text-slate-500">No orders here.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => <OrderRow key={o.id} order={o} onChange={(u) => { setOrders((list) => list!.map((x) => (x.id === u.id ? u : x))); onChanged(); }} />)}
        </div>
      )}
    </div>
  );
};

// ---------------- Products ----------------

type ProductForm = {
  id: string; brand: string; name: string; category: string; price: string; mrp: string; stock: string;
  b2bPrice: string; b2bMinQty: string; description: string; features: string; image: string; images: string; active: boolean;
};

const toForm = (p?: Product): ProductForm => ({
  id: p?.id ?? '', brand: p?.brand ?? 'National Geographic', name: p?.name ?? '', category: p?.category ?? '',
  price: p ? String(p.price) : '', mrp: p?.mrp ? String(p.mrp) : '', stock: p?.stock === null || p?.stock === undefined ? '' : String(p.stock),
  b2bPrice: p?.b2bPrice ? String(p.b2bPrice) : '', b2bMinQty: String(p?.b2bMinQty ?? 10), description: p?.description ?? '',
  features: (p?.features ?? []).join('\n'), image: p?.image ?? '', images: (p?.images ?? []).join('\n'), active: p?.active ?? true,
});

const ProductEditor: React.FC<{ product?: Product; categories: string[]; onClose: () => void; onSaved: () => void }> = ({ product, categories, onClose, onSaved }) => {
  const [f, setF] = useState<ProductForm>(toForm(product));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const num = (v: string) => (v.trim() === '' ? null : Number(v));
  const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      id: f.id.trim(), brand: f.brand, name: f.name, category: f.category.trim().toUpperCase(), price: Number(f.price),
      mrp: num(f.mrp), stock: num(f.stock), b2bPrice: num(f.b2bPrice), b2bMinQty: Number(f.b2bMinQty) || 10,
      description: f.description, features: lines(f.features), image: f.image.trim(), images: lines(f.images), active: f.active,
    };
    try {
      if (product) await api(`/products/${encodeURIComponent(product.id)}`, { method: 'PUT', body });
      else await api('/products', { body });
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-3xl sm:rounded-2xl p-5 sm:p-8 grid sm:grid-cols-2 gap-4 relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100" aria-label="Close"><X size={20} /></button>
        <h2 className="sm:col-span-2 text-xl font-bold">{product ? 'Edit product' : 'Add product'}</h2>
        <Field label="SKU / product code"><input required disabled={!!product} value={f.id} onChange={set('id')} className="input" placeholder="e.g. N20902.06" /></Field>
        <Field label="Brand">
          <input required list="brand-list" value={f.brand} onChange={set('brand')} className="input" />
          <datalist id="brand-list"><option value="National Geographic" /><option value="Shraddha" /></datalist>
        </Field>
        <Field label="Product name" className="sm:col-span-2"><input required minLength={2} value={f.name} onChange={set('name')} className="input" /></Field>
        <Field label="Category">
          <input required list="cat-list" value={f.category} onChange={set('category')} className="input" />
          <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Stock on hand" hint="Leave empty if you don't track stock for this item"><input type="number" min={0} value={f.stock} onChange={set('stock')} className="input" /></Field>
        <Field label="Selling price (₹)"><input required type="number" min={1} value={f.price} onChange={set('price')} className="input" /></Field>
        <Field label="MRP (₹)" hint="Shown struck-through to highlight the discount"><input type="number" min={1} value={f.mrp} onChange={set('mrp')} className="input" /></Field>
        <Field label="Wholesale price (₹, internal)"><input type="number" min={1} value={f.b2bPrice} onChange={set('b2bPrice')} className="input" /></Field>
        <Field label="Wholesale minimum quantity"><input type="number" min={1} value={f.b2bMinQty} onChange={set('b2bMinQty')} className="input" /></Field>
        <Field label="Main image URL" className="sm:col-span-2"><input required type="url" value={f.image} onChange={set('image')} className="input" /></Field>
        <Field label="More image URLs (one per line)" className="sm:col-span-2"><textarea rows={2} value={f.images} onChange={set('images')} className="input resize-y" /></Field>
        <Field label="Highlights (one per line)"><textarea rows={4} value={f.features} onChange={set('features')} className="input resize-y" /></Field>
        <Field label="Description"><textarea rows={4} value={f.description} onChange={set('description')} className="input resize-y" /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="w-4 h-4" /> Visible on the website</label>
        <div className="sm:col-span-2"><ErrorNote>{error}</ErrorNote></div>
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? <Spinner size={16} className="text-white" /> : 'Save product'}</button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
};

const StockCell: React.FC<{ product: Product; onSaved: () => void }> = ({ product, onSaved }) => {
  const [value, setValue] = useState(product.stock === null ? '' : String(product.stock));
  useEffect(() => setValue(product.stock === null ? '' : String(product.stock)), [product.stock]);
  const commit = async () => {
    const next = value.trim() === '' ? null : Math.max(0, Number(value));
    if (next === product.stock) return;
    await api(`/products/${encodeURIComponent(product.id)}/stock`, { method: 'PATCH', body: { stock: next } }).catch((e) => alert(e.message));
    onSaved();
  };
  return (
    <input
      type="number" min={0} value={value} placeholder="—" onChange={(e) => setValue(e.target.value)} onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      aria-label={`Stock for ${product.name}`}
      className={`w-20 input py-1.5 px-2 text-center ${product.stock === 0 ? 'border-red-300 bg-red-50' : product.stock !== null && product.stock <= 5 ? 'border-amber-300 bg-amber-50' : ''}`}
    />
  );
};

const ProductsTab: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const { refreshCatalog } = useProducts();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const load = useCallback(() => {
    api<Product[]>('/products', { query: { all: 1 } }).then(setProducts).catch(() => setProducts([]));
    refreshCatalog();
    onChanged();
  }, [refreshCatalog, onChanged]);

  useEffect(() => { api<Product[]>('/products', { query: { all: 1 } }).then(setProducts).catch(() => setProducts([])); }, []);

  const categories = useMemo(() => [...new Set((products ?? []).map((p) => p.category))].sort(), [products]);
  const filtered = (products ?? []).filter((p) => !search || `${p.name} ${p.id} ${p.category} ${p.brand}`.toLowerCase().includes(search.toLowerCase()));

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? Past orders keep their details. To hide it temporarily, untick "Visible" instead.`)) return;
    await api(`/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' }).catch((e) => alert(e.message));
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, SKU, category…" className="input pl-9 py-2.5" />
        </div>
        <button onClick={() => setEditing('new')} className="btn-dark"><Plus size={18} /> Add product</button>
      </div>
      {!products ? <div className="py-10 flex justify-center"><Spinner /></div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'opacity-60'}>
                  <td className="p-3">
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <img src={p.image} alt="" className="w-12 h-12 object-contain bg-slate-50 rounded-lg" />
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{titleCase(p.name)}</p>
                        <p className="text-xs text-slate-500">{p.id} · {p.brand} · {titleCase(p.category)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap"><span className="font-semibold">{inr(p.price)}</span>{p.mrp && <span className="block text-xs text-slate-400 line-through">{inr(p.mrp)}</span>}</td>
                  <td className="p-3"><StockCell product={p} onSaved={load} /></td>
                  <td className="p-3 text-xs">{p.active ? <span className="text-green-700 font-semibold">Visible</span> : <span className="text-slate-500">Hidden</span>}</td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <a href={`/products/${encodeURIComponent(p.id)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="View on site"><ExternalLink size={16} /></a>
                      <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Edit"><Edit size={16} /></button>
                      <button onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ProductEditor product={editing === 'new' ? undefined : editing} categories={categories} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
};

// ---------------- Leads ----------------

const LEAD_STATUSES: Inquiry['status'][] = ['new', 'contacted', 'quoted', 'won', 'lost'];
const LEAD_TYPE_LABEL: Record<Inquiry['type'], string> = { bulk: 'Bulk quote', dealer: 'Dealer', contact: 'Contact', support: 'Support' };

const LeadsTab: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const [status, setStatus] = useState<Inquiry['status'] | 'all'>('new');
  const [leads, setLeads] = useState<Inquiry[] | null>(null);

  const load = useCallback(() => { api<Inquiry[]>('/staff/inquiries', { query: { status } }).then(setLeads).catch(() => setLeads([])); }, [status]);
  useEffect(load, [load]);

  const update = async (id: number, body: Partial<Pick<Inquiry, 'status' | 'notes'>>) => {
    await api(`/staff/inquiries/${id}`, { method: 'PATCH', body }).catch((e) => alert(e.message));
    setLeads((l) => l!.map((x) => (x.id === id ? { ...x, ...body } : x)));
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['all', ...LEAD_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{s}</button>
        ))}
      </div>
      {!leads ? <div className="py-10 flex justify-center"><Spinner /></div> : leads.length === 0 ? (
        <p className="card p-10 text-center text-slate-500">No enquiries here.</p>
      ) : leads.map((l) => (
        <div key={l.id} className="card p-4 grid md:grid-cols-[1fr_260px] gap-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{LEAD_TYPE_LABEL[l.type]}</span>
              <span className="font-semibold text-slate-900">{l.name}</span>
              {l.company && <span className="text-slate-500">· {l.company}</span>}
              {l.city && <span className="text-slate-500">· {l.city}</span>}
              <span className="text-xs text-slate-400 ml-auto">{formatDate(l.createdAt)}</span>
            </div>
            {(l.productName || l.quantity) && <p className="text-slate-700">{l.productName ? titleCase(l.productName) : 'Mixed products'}{l.quantity ? ` · Qty ${l.quantity}` : ''}</p>}
            {l.message && <p className="text-slate-600 whitespace-pre-line">{l.message}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <a href={`tel:${l.phone}`} className="btn-outline px-3 py-1.5"><Phone size={14} /> {l.phone}</a>
              <a href={whatsappLink(`Hi ${l.name.split(' ')[0]}, this is SPA Enterprise regarding your enquiry.`, waNumber(l.phone))} target="_blank" rel="noopener noreferrer" className="btn-outline px-3 py-1.5 text-green-700"><MessageCircle size={14} /> WhatsApp</a>
              {l.email && <a href={`mailto:${l.email}`} className="btn-outline px-3 py-1.5">Email</a>}
            </div>
          </div>
          <div className="space-y-2">
            <select value={l.status} onChange={(e) => update(l.id, { status: e.target.value as Inquiry['status'] })} className="input py-2 capitalize">
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea defaultValue={l.notes ?? ''} onBlur={(e) => e.target.value !== (l.notes ?? '') && update(l.id, { notes: e.target.value })} rows={3} placeholder="Internal notes (saved automatically)" className="input text-xs resize-none" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------- Shell ----------------

const StaffDashboard: React.FC = () => {
  useDocumentMeta('Staff dashboard');
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('orders');
  const [summary, setSummary] = useState<Summary | null>(null);

  const loadSummary = useCallback(() => { api<Summary>('/staff/summary').then(setSummary).catch(() => {}); }, []);
  useEffect(loadSummary, [loadSummary]);

  const tabs: { id: Tab; label: string; icon: React.FC<{ size?: number }>; badge?: number }[] = [
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: summary?.ordersToProcess },
    { id: 'products', label: 'Products & stock', icon: Package, badge: summary?.lowStock.length },
    { id: 'leads', label: 'Leads', icon: Users, badge: summary?.newInquiries },
    { id: 'social', label: 'Social posts', icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold"><img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" /> <span className="hidden sm:inline">SPA Staff</span></Link>
          <nav className="flex gap-1 overflow-x-auto ml-2">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setTab(id)} className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${tab === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Icon size={16} /> <span className="hidden md:inline">{label}</span>
                {!!badge && <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{badge}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {user?.role === 'owner' && <Link to="/owner" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Owner dashboard"><Briefcase size={18} /></Link>}
            <a href="/catalog" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Printable catalogue"><FileText size={18} /></a>
            <Link to="/" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="View website"><Home size={18} /></Link>
            <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" title="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {tab !== 'social' && summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card p-4"><p className="text-xs text-slate-500">Orders to pack</p><p className="text-2xl font-bold">{summary.ordersToProcess}</p></div>
            <div className="card p-4"><p className="text-xs text-slate-500">Orders today</p><p className="text-2xl font-bold">{summary.ordersToday}</p></div>
            <div className="card p-4"><p className="text-xs text-slate-500">New leads</p><p className="text-2xl font-bold">{summary.newInquiries}</p></div>
            <div className="card p-4 flex items-start justify-between">
              <div><p className="text-xs text-slate-500">Low / out of stock</p><p className="text-2xl font-bold">{summary.lowStock.length}</p></div>
              <button onClick={loadSummary} className="p-1.5 text-slate-400 hover:text-slate-700" aria-label="Refresh"><RefreshCw size={16} /></button>
            </div>
          </div>
        )}
        {tab === 'orders' && summary && summary.lowStock.length > 0 && (
          <p className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <span>Running low: {summary.lowStock.slice(0, 4).map((p) => `${titleCase(p.name).slice(0, 40)} (${p.stock})`).join(', ')}{summary.lowStock.length > 4 ? ` and ${summary.lowStock.length - 4} more` : ''}.</span>
          </p>
        )}
        {tab === 'orders' && <OrdersTab onChanged={loadSummary} />}
        {tab === 'products' && <ProductsTab onChanged={loadSummary} />}
        {tab === 'leads' && <LeadsTab onChanged={loadSummary} />}
        {tab === 'social' && <AutoPostHub />}
      </main>
    </div>
  );
};

export default StaffDashboard;

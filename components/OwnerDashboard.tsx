import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Briefcase, LayoutDashboard, LogOut, Home, Trash2, UserPlus, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import { Link, navigate, useDocumentMeta } from '../lib/router';
import { inr, titleCase } from '../lib/format';
import { ErrorNote, Field, ORDER_STATUS_LABEL, Spinner } from './ui';
import type { OrderStatus } from '../types';

interface Analytics {
  days: number;
  revenue: number; revenuePrev: number;
  orders: number; ordersPrev: number;
  customers: number; avgOrderValue: number;
  collected: number; codPending: number;
  repeatCustomerRate: number; abandonedCheckouts: number;
  daily: { day: string; orders: number; revenue: number }[];
  topProducts: { productId: string; name: string; brand: string; units: number; revenue: number }[];
  byBrand: { brand: string; revenue: number }[];
  byStatus: { status: OrderStatus; count: number }[];
  byPayment: { method: 'razorpay' | 'cod'; count: number; revenue: number }[];
  inquiries: { type: string; status: string; count: number }[];
  registeredCustomers: number;
  catalog: { products: number; outOfStock: number; lowStock: number };
}

const ACCENT = '#2563eb';
const compactInr = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1)}K` : `₹${n}`);

const StatTile: React.FC<{ label: string; value: string; current?: number; previous?: number; note?: string }> = ({ label, value, current, previous, note }) => {
  let delta: React.ReactNode = null;
  if (current !== undefined && previous !== undefined) {
    if (previous === 0) delta = current > 0 ? <span className="text-xs text-slate-500">new vs previous period</span> : null;
    else {
      const pct = Math.round(((current - previous) / previous) * 100);
      const up = pct >= 0;
      delta = (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-700' : 'text-red-600'}`}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{up ? '+' : ''}{pct}% <span className="font-normal text-slate-500 ml-1">vs previous period</span>
        </span>
      );
    }
  }
  return (
    <div className="card p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <div className="mt-1 min-h-4">{delta ?? (note && <span className="text-xs text-slate-500">{note}</span>)}</div>
    </div>
  );
};

// Fill days with no orders so the chart's time axis is continuous.
const fillDays = (rows: Analytics['daily'], days: number) => {
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: { day: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), revenue: map.get(key)?.revenue ?? 0, orders: map.get(key)?.orders ?? 0 });
  }
  return out;
};

const RevenueChart: React.FC<{ data: Analytics['daily']; days: number }> = ({ data, days }) => {
  const series = useMemo(() => fillDays(data, Math.min(days, 90)), [data, days]);
  return (
    <div className="h-64" role="img" aria-label="Daily booked revenue">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tickFormatter={compactInr} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={56} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(v: number, _n, item) => [`${inr(v)} · ${item.payload.orders} order${item.payload.orders === 1 ? '' : 's'}`, 'Revenue']}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="revenue" fill={ACCENT} maxBarSize={24} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const HBar: React.FC<{ rows: { label: string; value: number; sub?: string }[] }> = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm mb-1"><span className="text-slate-700">{r.label}</span><span className="font-semibold text-slate-900">{inr(r.value)}{r.sub && <span className="text-slate-500 font-normal"> · {r.sub}</span>}</span></div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden" title={`${r.label}: ${inr(r.value)}`}>
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: ACCENT }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

// ---------- Team & coupons ----------

interface TeamMember { id: number; name: string; email: string; role: 'seller' | 'owner' }
interface Coupon { code: string; percentOff: number; minOrder: number; active: number }

const TeamPanel: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { api<TeamMember[]>('/staff/team').then(setTeam).catch(() => {}); }, []);
  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api('/staff/team', { body: form });
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <section className="card p-5 space-y-4">
      <h2 className="font-semibold flex items-center gap-2"><UserPlus size={18} /> Staff logins</h2>
      <ul className="divide-y divide-slate-100 text-sm">
        {team.map((m) => (
          <li key={m.id} className="flex items-center justify-between py-2">
            <span><span className="font-medium">{m.name}</span> <span className="text-slate-500">· {m.email} · {m.role === 'owner' ? 'Owner' : 'Staff'}</span></span>
            {m.role === 'seller' && m.id !== user?.id && (
              <button onClick={async () => { if (confirm(`Remove staff access for ${m.name}?`)) { await api(`/staff/team/${m.id}`, { method: 'DELETE' }); load(); } }} className="p-1.5 text-slate-400 hover:text-red-600" aria-label={`Remove ${m.name}`}><Trash2 size={16} /></button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="grid sm:grid-cols-3 gap-2">
        <input required minLength={2} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input py-2.5" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input py-2.5" />
        <input required minLength={8} type="text" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input py-2.5" />
        <button type="submit" className="btn-dark sm:col-span-3">Add staff member</button>
      </form>
      <ErrorNote>{error}</ErrorNote>
    </section>
  );
};

const CouponPanel: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: '', percentOff: '10', minOrder: '0' });
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { api<Coupon[]>('/staff/coupons').then(setCoupons).catch(() => {}); }, []);
  useEffect(load, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api('/staff/coupons', { body: { code: form.code, percentOff: Number(form.percentOff), minOrder: Number(form.minOrder) } });
      setForm({ code: '', percentOff: '10', minOrder: '0' });
      load();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <section className="card p-5 space-y-4">
      <h2 className="font-semibold flex items-center gap-2"><Tag size={18} /> Discount coupons</h2>
      {coupons.length === 0 ? <p className="text-sm text-slate-500">No coupons yet. Create one to run a festive offer or reward repeat buyers.</p> : (
        <ul className="divide-y divide-slate-100 text-sm">
          {coupons.map((c) => (
            <li key={c.code} className="flex items-center justify-between py-2">
              <span><span className="font-mono font-semibold">{c.code}</span> <span className="text-slate-500">· {c.percentOff}% off{c.minOrder ? ` above ${inr(c.minOrder)}` : ''}</span></span>
              <button onClick={async () => { await api(`/staff/coupons/${c.code}`, { method: 'DELETE' }); load(); }} className="p-1.5 text-slate-400 hover:text-red-600" aria-label={`Delete ${c.code}`}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={save} className="grid grid-cols-3 gap-2 items-end">
        <Field label="Code"><input required pattern="[A-Za-z0-9]{3,20}" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input py-2.5" placeholder="DIWALI10" /></Field>
        <Field label="% off"><input required type="number" min={1} max={90} value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: e.target.value })} className="input py-2.5" /></Field>
        <Field label="Min. order ₹"><input type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input py-2.5" /></Field>
        <button type="submit" className="btn-dark col-span-3">Save coupon</button>
      </form>
      <ErrorNote>{error}</ErrorNote>
    </section>
  );
};

// ---------- Page ----------

const PERIODS = [7, 30, 90, 365];
const LEAD_STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'];

const OwnerDashboard: React.FC = () => {
  useDocumentMeta('Owner dashboard');
  const { user, logout } = useAuth();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    api<Analytics>('/staff/analytics', { query: { days } }).then(setData).catch((e) => setError(e.message));
  }, [days]);

  const leadTotals = useMemo(() => {
    const byStage: Record<string, number> = {};
    for (const r of data?.inquiries ?? []) byStage[r.status] = (byStage[r.status] ?? 0) + r.count;
    return byStage;
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center"><Briefcase size={18} /></span>
          <div className="leading-tight"><p className="font-bold">Owner dashboard</p><p className="text-xs text-slate-500">{user?.name}</p></div>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/staff" className="btn-outline px-3 py-2"><LayoutDashboard size={16} /> <span className="hidden sm:inline">Orders & stock</span></Link>
            <Link to="/" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="View website"><Home size={18} /></Link>
            <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" title="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Business performance</h1>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            {PERIODS.map((d) => (
              <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${days === d ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                {d === 365 ? '1 year' : `${d} days`}
              </button>
            ))}
          </div>
        </div>
        <ErrorNote>{error}</ErrorNote>

        {!data ? <div className="py-20 flex justify-center"><Spinner /></div> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatTile label="Revenue (booked)" value={inr(data.revenue)} current={data.revenue} previous={data.revenuePrev} />
              <StatTile label="Orders" value={data.orders.toLocaleString('en-IN')} current={data.orders} previous={data.ordersPrev} />
              <StatTile label="Average order value" value={inr(data.avgOrderValue)} note={`${data.customers} unique customers`} />
              <StatTile label="Repeat customer rate" value={`${data.repeatCustomerRate}%`} note="All-time, by phone number" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatTile label="Payments received online" value={inr(data.collected)} />
              <StatTile label="COD still to collect" value={inr(data.codPending)} note="All open COD orders" />
              <StatTile label="Unfinished online checkouts" value={String(data.abandonedCheckouts)} note="Follow up by phone to recover sales" />
              <StatTile label="Catalogue" value={`${data.catalog.products} products`} note={`${data.catalog.outOfStock ?? 0} out of stock · ${data.catalog.lowStock ?? 0} low`} />
            </div>

            <section className="card p-5">
              <h2 className="font-semibold">Daily revenue</h2>
              <p className="text-xs text-slate-500 mb-4">Booked orders (paid online or COD), last {Math.min(days, 90)} days</p>
              {data.daily.length ? <RevenueChart data={data.daily} days={days} /> : <p className="text-sm text-slate-500 py-16 text-center">No orders in this period yet.</p>}
            </section>

            <div className="grid lg:grid-cols-3 gap-6">
              <section className="card p-5 lg:col-span-2 overflow-x-auto">
                <h2 className="font-semibold mb-3">Best-selling products</h2>
                {data.topProducts.length === 0 ? <p className="text-sm text-slate-500">No sales yet.</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-xs text-slate-500 text-left"><tr><th className="py-2">Product</th><th className="py-2 text-right">Units</th><th className="py-2 text-right">Revenue</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.topProducts.map((p) => (
                        <tr key={p.productId}><td className="py-2 pr-3"><span className="line-clamp-1">{titleCase(p.name)}</span><span className="text-xs text-slate-500">{p.productId} · {p.brand}</span></td><td className="py-2 text-right">{p.units}</td><td className="py-2 text-right font-semibold">{inr(p.revenue)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
              <section className="card p-5 space-y-6">
                <div>
                  <h2 className="font-semibold mb-3">Revenue by brand</h2>
                  {data.byBrand.length ? <HBar rows={data.byBrand.map((b) => ({ label: b.brand, value: b.revenue }))} /> : <p className="text-sm text-slate-500">No sales yet.</p>}
                </div>
                <div>
                  <h2 className="font-semibold mb-3">Payment method</h2>
                  {data.byPayment.length ? <HBar rows={data.byPayment.map((p) => ({ label: p.method === 'cod' ? 'Cash on Delivery' : 'Online', value: p.revenue, sub: `${p.count} orders` }))} /> : <p className="text-sm text-slate-500">No sales yet.</p>}
                </div>
              </section>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="card p-5">
                <h2 className="font-semibold mb-3">Orders by status</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
                    <li key={s} className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">{ORDER_STATUS_LABEL[s]}</p><p className="text-lg font-semibold">{data.byStatus.find((x) => x.status === s)?.count ?? 0}</p></li>
                  ))}
                </ul>
              </section>
              <section className="card p-5">
                <h2 className="font-semibold mb-3">Leads pipeline</h2>
                <ul className="grid grid-cols-5 gap-2 text-center text-sm">
                  {LEAD_STAGES.map((s) => (
                    <li key={s} className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500 capitalize">{s}</p><p className="text-lg font-semibold">{leadTotals[s] ?? 0}</p></li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 mt-3">Bulk, dealer, contact and support enquiries received in this period. Work them from the Leads tab.</p>
              </section>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <TeamPanel />
              <CouponPanel />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;

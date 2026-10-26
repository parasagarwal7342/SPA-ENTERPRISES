import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import { useDocumentMeta, useLocation } from '../lib/router';
import { ErrorNote, Field, Spinner } from './ui';
import OrderCard from './OrderCard';
import type { Order } from '../types';

const TrackOrder: React.FC = () => {
  useDocumentMeta('Track your order');
  const { search } = useLocation();
  const [orderNumber, setOrderNumber] = useState(new URLSearchParams(search).get('order') ?? '');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('spa_checkout_details') || '{}');
      if (saved.phone) setContact(saved.phone);
    } catch { /* ignore */ }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      setOrder(await api<Order>('/orders/track', { query: { orderNumber: orderNumber.trim(), contact: contact.trim() } }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Track your order</h1>
      <p className="text-slate-500 mb-6">Enter the order number from your confirmation and the mobile number or email you used.</p>
      <form onSubmit={submit} className="card p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end mb-6">
        <Field label="Order number"><input required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} placeholder="SPA-…" className="input" /></Field>
        <Field label="Mobile or email"><input required value={contact} onChange={(e) => setContact(e.target.value)} className="input" /></Field>
        <button type="submit" disabled={busy} className="btn-dark h-[46px]">{busy ? <Spinner size={18} className="text-white" /> : <><Search size={16} /> Track</>}</button>
      </form>
      <ErrorNote>{error}</ErrorNote>
      {order && <OrderCard order={order} />}
    </div>
  );
};

export default TrackOrder;

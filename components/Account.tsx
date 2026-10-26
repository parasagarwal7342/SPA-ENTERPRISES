import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import { Link, useDocumentMeta } from '../lib/router';
import { ErrorNote, Spinner } from './ui';
import OrderCard from './OrderCard';
import type { Order } from '../types';

const Account: React.FC = () => {
  useDocumentMeta('My orders');
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Order[]>('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">My orders</h1>
      <p className="text-slate-500 mb-8">Signed in as {user?.email}</p>
      <ErrorNote>{error}</ErrorNote>
      {!orders && !error && <div className="flex justify-center py-10"><Spinner /></div>}
      {orders?.length === 0 && (
        <div className="card p-10 text-center">
          <Package size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 mb-1">No orders yet.</p>
          <p className="text-sm text-slate-500 mb-6">Orders placed while signed out can be found on the <Link to="/track" className="text-blue-600 font-semibold">tracking page</Link>.</p>
          <Link to="/products" className="btn-primary">Start shopping</Link>
        </div>
      )}
      <div className="space-y-4">{orders?.map((o) => <OrderCard key={o.id} order={o} />)}</div>
    </div>
  );
};

export default Account;

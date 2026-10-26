import React from 'react';
import { Loader2 } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '../types';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <Loader2 size={size} className={`animate-spin text-blue-600 ${className}`} aria-label="Loading" />
);

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({ label, hint, children, className = '' }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-xs font-semibold text-slate-600">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </label>
);

export const ErrorNote: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  children ? <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{children}</p> : null;

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  packed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-violet-50 text-violet-700 border-violet-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Awaiting payment', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ORDER_STATUS_STYLE[status]}`}>{ORDER_STATUS_LABEL[status]}</span>
);

export const PaymentBadge: React.FC<{ method: 'razorpay' | 'cod'; status: PaymentStatus }> = ({ method, status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : status === 'pending' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
    {method === 'cod' ? 'COD' : 'Online'} · {status}
  </span>
);

export const ORDER_STEPS: OrderStatus[] = ['confirmed', 'packed', 'shipped', 'delivered'];

export const OrderProgress: React.FC<{ status: OrderStatus }> = ({ status }) => {
  if (status === 'cancelled' || status === 'pending') return <OrderStatusBadge status={status} />;
  const current = ORDER_STEPS.indexOf(status);
  return (
    <ol className="flex items-center gap-2 text-[11px] font-semibold">
      {ORDER_STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 ${i <= current ? 'text-green-700' : 'text-slate-400'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${i <= current ? 'bg-green-500' : 'bg-slate-200'}`} />
            {ORDER_STATUS_LABEL[s]}
          </span>
          {i < ORDER_STEPS.length - 1 && <span className={`w-5 h-px ${i < current ? 'bg-green-400' : 'bg-slate-200'}`} />}
        </li>
      ))}
    </ol>
  );
};

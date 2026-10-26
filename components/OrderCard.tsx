import React from 'react';
import { inr, formatDate, titleCase } from '../lib/format';
import { OrderProgress, PaymentBadge } from './ui';
import type { Order } from '../types';

const OrderCard: React.FC<{ order: Order; children?: React.ReactNode }> = ({ order, children }) => (
  <article className="card p-5">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <p className="font-bold text-slate-900">{order.orderNumber}</p>
        <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">{inr(order.total)}</p>
        <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
      </div>
    </div>
    <div className="mb-4 overflow-x-auto"><OrderProgress status={order.status} /></div>
    {order.trackingInfo && <p className="text-sm bg-violet-50 text-violet-800 rounded-lg px-3 py-2 mb-4">Shipment: {order.trackingInfo}</p>}
    <ul className="divide-y divide-slate-100 text-sm">
      {order.items.map((i) => (
        <li key={i.productId} className="flex items-center gap-3 py-2">
          {i.image && <img src={i.image} alt="" className="w-10 h-10 object-contain bg-slate-50 rounded-lg" />}
          <span className="flex-grow text-slate-700">{titleCase(i.name)} <span className="text-slate-400">× {i.quantity}</span></span>
          <span className="font-semibold">{inr(i.unitPrice * i.quantity)}</span>
        </li>
      ))}
    </ul>
    {children}
  </article>
);

export default OrderCard;

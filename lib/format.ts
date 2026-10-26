export const inr = (n: number | null | undefined) =>
  n === null || n === undefined ? '' : `₹${Math.round(n).toLocaleString('en-IN')}`;

export const percentOff = (price: number, mrp: number | null | undefined) =>
  mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const formatDate = (iso: string) =>
  new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const WHATSAPP_DEFAULT = '919312277087';
export const whatsappLink = (text: string, number = WHATSAPP_DEFAULT) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

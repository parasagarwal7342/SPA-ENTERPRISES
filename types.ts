export enum Brand {
  NationalGeographic = 'National Geographic',
  Shraddha = 'Shraddha'
}

export interface Product {
  id: string;
  brand: Brand | string;
  name: string;
  description: string;
  features: string[];
  image: string;
  images: string[];
  category: string;
  price: number;
  mrp: number | null;
  /** null = stock not tracked (always available) */
  stock: number | null;
  b2bPrice: number | null;
  b2bMinQty: number;
  active: boolean;
}

export type UserRole = 'customer' | 'seller' | 'owner';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ShippingRegion = 'delhi' | 'india' | 'global';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer: { name: string; email: string; phone: string; address: string; city: string; pincode: string };
  shippingRegion: ShippingRegion;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingInfo: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface ShippingRule { label: string; fee: number; freeAbove: number }

export interface SiteConfig {
  paymentMethods: ('razorpay' | 'cod')[];
  razorpayKeyId: string | null;
  shipping: Record<ShippingRegion, ShippingRule>;
  whatsappNumber: string;
  aiEnabled: boolean;
}

export interface Inquiry {
  id: number;
  type: 'bulk' | 'dealer' | 'contact' | 'support';
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  city: string | null;
  productId: string | null;
  productName: string | null;
  quantity: number | null;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  notes: string | null;
  createdAt: string;
}

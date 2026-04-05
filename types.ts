
export enum Brand {
  NationalGeographic = 'National Geographic',
  Shraddha = 'Shraddha'
}

export interface Product {
  id: string;
  brand: Brand;
  name: string;
  description: string;
  features: string[];
  image: string;
  images?: string[]; // Multiple angles
  category: string;
  price?: string;
  mrp?: string;
}

export interface InquiryFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  type: 'B2B' | 'Retail' | 'Support';
}

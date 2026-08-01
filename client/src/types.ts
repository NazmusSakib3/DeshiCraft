export type Role = 'customer' | 'seller' | 'admin';

export interface SellerProfile {
  shopName: string;
  bio?: string;
  region?: string;
  approved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  sellerProfile?: SellerProfile;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Category | string;
  seller: { _id: string; name: string; sellerProfile?: SellerProfile } | string;
  stock: number;
  material?: string;
  region?: string;
  tags: string[];
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { _id: string; name: string; avatarUrl?: string };
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'stripe' | 'sslcommerz';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  product: string;
  seller: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  shippingAddress: Address;
  itemstotal: number;
  shippingfee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

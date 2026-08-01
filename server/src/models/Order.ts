import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { Address } from './User.js';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'stripe' | 'sslcommerz';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  product: Types.ObjectId;
  seller: Types.ObjectId;
  title: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: OrderItem[];
  shippingAddress: Address;
  itemstotal: number;
  shippingfee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  sslTranId?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    itemstotal: { type: Number, required: true, min: 0 },
    shippingfee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cod', 'stripe', 'sslcommerz'], required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    stripeSessionId: { type: String },
    sslTranId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

export const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', orderSchema);

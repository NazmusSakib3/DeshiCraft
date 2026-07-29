import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Types.ObjectId;
  seller: Types.ObjectId;
  stock: number;
  material?: string;
  region?: string;
  tags: string[];
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    material: { type: String, trim: true },
    region: { type: String, trim: true },
    tags: { type: [String], default: [] },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

productSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>('Product', productSchema);

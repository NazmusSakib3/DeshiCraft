import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>('Category', categorySchema);

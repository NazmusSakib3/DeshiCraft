import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import { Product } from './Product.js';

export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

// One review per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

async function recalculateProductRating(productId: Types.ObjectId): Promise<void> {
  const result = await Review.aggregate<{ _id: Types.ObjectId; avg: number; count: number }>([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const stats = result[0];
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats ? Math.round(stats.avg * 10) / 10 : 0,
    ratingCount: stats ? stats.count : 0,
  });
}

reviewSchema.post('save', async function afterSave(doc) {
  await recalculateProductRating(doc.product);
});

reviewSchema.post('findOneAndDelete', async function afterDelete(doc: IReview | null) {
  if (doc) await recalculateProductRating(doc.product);
});

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>('Review', reviewSchema);

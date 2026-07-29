import type { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw ApiError.notFound('Product not found');
  const reviews = await Review.find({ product: product._id })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatarUrl');
  res.json({ reviews });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw ApiError.notFound('Product not found');

  // Only buyers who purchased and received the product can review.
  const hasPurchased = await Order.exists({
    user: req.user!.id,
    'items.product': product._id,
    status: { $in: ['delivered', 'confirmed', 'shipped'] },
  });
  if (!hasPurchased) {
    throw ApiError.forbidden('You can only review products you have purchased');
  }

  const existing = await Review.findOne({ product: product._id, user: req.user!.id });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  const review = await Review.create({
    product: product._id,
    user: req.user!.id,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  await review.populate('user', 'name avatarUrl');
  res.status(201).json({ review });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  if (req.user!.role !== 'admin' && String(review.user) !== req.user!.id) {
    throw ApiError.forbidden('You can only delete your own review');
  }
  await Review.findOneAndDelete({ _id: review._id });
  res.json({ message: 'Review deleted' });
});

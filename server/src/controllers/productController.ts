import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { Product, type IProduct } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uniqueSlug } from '../utils/slug.js';

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';

const sortMap: Record<SortKey, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { ratingAverage: -1, ratingCount: -1 },
  popular: { ratingCount: -1 },
};

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  const { search, category, minPrice, maxPrice, region, sort } = req.query as Record<string, string>;

  const filter: FilterQuery<IProduct> = { isActive: true };

  if (search) filter.$text = { $search: search };
  if (region) filter.region = region;

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) filter.category = categoryDoc._id;
    else filter.category = null; // no match -> empty result
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortBy = sortMap[(sort as SortKey) ?? 'newest'] ?? sortMap.newest;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('seller', 'name sellerProfile.shopName'),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate('seller', 'name sellerProfile');
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.body.category);
  if (!category) throw ApiError.badRequest('Invalid category');

  const product = await Product.create({
    ...req.body,
    slug: uniqueSlug(req.body.title),
    seller: req.user!.id,
  });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (req.user!.role !== 'admin' && String(product.seller) !== req.user!.id) {
    throw ApiError.forbidden('You can only edit your own products');
  }

  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) throw ApiError.badRequest('Invalid category');
  }

  Object.assign(product, req.body);
  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (req.user!.role !== 'admin' && String(product.seller) !== req.user!.id) {
    throw ApiError.forbidden('You can only delete your own products');
  }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

export const listMyProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({ seller: req.user!.id })
    .sort({ createdAt: -1 })
    .populate('category', 'name slug');
  res.json({ items: products });
});

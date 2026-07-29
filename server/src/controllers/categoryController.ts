import type { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slug.js';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, imageUrl } = req.body;
  const slug = slugify(name);
  const exists = await Category.findOne({ slug });
  if (exists) throw ApiError.conflict('Category already exists');
  const category = await Category.create({ name, slug, description, imageUrl: imageUrl || undefined });
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  const { name, description, imageUrl } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (imageUrl !== undefined) category.imageUrl = imageUrl || undefined;
  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse > 0) throw ApiError.badRequest('Cannot delete a category that still has products');
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  res.json({ message: 'Category deleted' });
});

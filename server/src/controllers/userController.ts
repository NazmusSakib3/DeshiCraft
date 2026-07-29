import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  if (typeof req.body.name === 'string') user.name = req.body.name;
  if (typeof req.body.avatarUrl === 'string') user.avatarUrl = req.body.avatarUrl;
  await user.save();

  res.json({ user: { id: String(user._id), name: user.name, avatarUrl: user.avatarUrl } });
});

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ addresses: user.addresses });
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  user.addresses = user.addresses.filter((a) => String((a as { _id?: unknown })._id) !== req.params.addressId);
  await user.save();
  res.json({ addresses: user.addresses });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' },
  });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ items: user.wishlist });
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  const index = user.wishlist.findIndex((id) => String(id) === productId);
  let added: boolean;
  if (index >= 0) {
    user.wishlist.splice(index, 1);
    added = false;
  } else {
    user.wishlist.push(product._id);
    added = true;
  }
  await user.save();
  res.json({ added, wishlist: user.wishlist.map(String) });
});

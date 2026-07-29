import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const applyAsSeller = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.badRequest('Admins cannot register as sellers');

  user.sellerProfile = {
    shopName: req.body.shopName,
    bio: req.body.bio,
    region: req.body.region,
    approved: false,
  };
  // Become a seller immediately; admin approval gates public visibility badge.
  user.role = 'seller';
  await user.save();

  res.status(201).json({
    message: 'Seller profile created. Awaiting admin approval.',
    sellerProfile: user.sellerProfile,
    role: user.role,
  });
});

export const sellerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = req.user!.id;

  const [productCount, activeCount, orders] = await Promise.all([
    Product.countDocuments({ seller: sellerId }),
    Product.countDocuments({ seller: sellerId, isActive: true }),
    Order.find({ 'items.seller': sellerId }),
  ]);

  let revenue = 0;
  let unitsSold = 0;
  const statusCounts: Record<string, number> = {};

  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
    if (order.status === 'cancelled') continue;
    for (const item of order.items) {
      if (String(item.seller) === sellerId) {
        revenue += item.price * item.quantity;
        unitsSold += item.quantity;
      }
    }
  }

  const lowStock = await Product.find({ seller: sellerId, stock: { $lte: 3 } })
    .select('title stock')
    .sort({ stock: 1 })
    .limit(5);

  res.json({
    stats: {
      productCount,
      activeCount,
      orderCount: orders.length,
      revenue,
      unitsSold,
      statusCounts,
    },
    lowStock,
  });
});

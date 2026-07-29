import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [userCount, sellerCount, productCount, orders] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    Product.countDocuments(),
    Order.find(),
  ]);

  let revenue = 0;
  const statusCounts: Record<string, number> = {};
  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
    if (order.status !== 'cancelled') revenue += order.total;
  }

  // Applications over the last 7 days (created orders per day).
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const daily = await Order.aggregate<{ _id: string; count: number; revenue: number }>([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    stats: { userCount, sellerCount, productCount, orderCount: orders.length, revenue, statusCounts },
    daily,
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const filter: Record<string, unknown> = {};

  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'blocked') filter.isBlocked = true;
  if (req.query.status === 'active') filter.isBlocked = false;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
});

async function assertAdminCanModerateUser(adminId: string, targetId: string) {
  if (adminId === targetId) {
    throw ApiError.badRequest('You cannot moderate your own account');
  }
  const target = await User.findById(targetId);
  if (!target) throw ApiError.notFound('User not found');
  if (target.role === 'admin') {
    throw ApiError.badRequest('Admin accounts cannot be blocked or removed');
  }
  return target;
}

export const updateUserBlock = asyncHandler(async (req: Request, res: Response) => {
  const user = await assertAdminCanModerateUser(req.user!.id, req.params.id);
  const blocked = req.body.blocked === true;

  user.isBlocked = blocked;
  user.blockReason = blocked ? req.body.reason || 'Violated community guidelines' : undefined;
  await user.save();

  if (blocked && user.role === 'seller') {
    await Product.updateMany({ seller: user._id }, { isActive: false });
  }

  res.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      blockReason: user.blockReason,
    },
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await assertAdminCanModerateUser(req.user!.id, req.params.id);

  await Product.deleteMany({ seller: user._id });
  await Review.deleteMany({ user: user._id });
  await user.deleteOne();

  res.json({ message: 'User removed from the platform' });
});

export const listSellers = asyncHandler(async (_req: Request, res: Response) => {
  const sellers = await User.find({ role: 'seller' }).select('-password').sort({ createdAt: -1 });
  res.json({ sellers });
});

export const approveSeller = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'seller' || !user.sellerProfile) {
    throw ApiError.notFound('Seller not found');
  }
  user.sellerProfile.approved = req.body.approved !== false;
  await user.save();
  res.json({ sellerProfile: user.sellerProfile });
});

export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const filter = req.query.status ? { status: req.query.status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
});

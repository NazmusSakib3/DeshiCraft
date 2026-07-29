import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, type OrderItem, type OrderStatus } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SHIPPING_FEE = 60; // flat BDT shipping for the demo

function generateOrderNumber(): string {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate(),
  ).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DC-${stamp}-${rand}`;
}

// Valid forward transitions for the order status pipeline.
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  const productIds = items.map((i: { product: string }) => i.product);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems: OrderItem[] = [];
  let itemstotal = 0;

  for (const item of items as { product: string; quantity: number }[]) {
    const product = productMap.get(item.product);
    if (!product) throw ApiError.badRequest(`Product ${item.product} is unavailable`);
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Only ${product.stock} left of "${product.title}"`);
    }
    itemstotal += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      seller: product.seller,
      title: product.title,
      image: product.images[0],
      price: product.price,
      quantity: item.quantity,
    });
  }

  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      for (const item of items as { product: string; quantity: number }[]) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } },
          { session },
        );
      }
      const docs = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            user: req.user!.id,
            items: orderItems,
            shippingAddress,
            itemstotal,
            shippingfee: SHIPPING_FEE,
            total: itemstotal + SHIPPING_FEE,
            paymentMethod,
            paymentStatus: 'unpaid',
            status: 'pending',
          },
        ],
        { session },
      );
      created = docs[0];
    });
    res.status(201).json({ order: created });
  } catch (err) {
    // Fallback for standalone Mongo without replica-set transactions.
    if (err instanceof Error && /Transaction numbers|replica set|transactions are not/i.test(err.message)) {
      for (const item of items as { product: string; quantity: number }[]) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
      }
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        user: req.user!.id,
        items: orderItems,
        shippingAddress,
        itemstotal,
        shippingfee: SHIPPING_FEE,
        total: itemstotal + SHIPPING_FEE,
        paymentMethod,
        paymentStatus: 'unpaid',
        status: 'pending',
      });
      res.status(201).json({ order });
      return;
    }
    throw err;
  } finally {
    await session.endSession();
  }
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = String((order.user as { _id?: unknown })._id ?? order.user) === req.user!.id;
  const isSellerInOrder = order.items.some((i) => String(i.seller) === req.user!.id);
  if (req.user!.role !== 'admin' && !isOwner && !isSellerInOrder) {
    throw ApiError.forbidden('You cannot view this order');
  }
  res.json({ order });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.user) !== req.user!.id) throw ApiError.forbidden('Not your order');
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest('This order can no longer be cancelled');
  }
  // Restock
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
  }
  order.status = 'cancelled';
  await order.save();
  res.json({ order });
});

export const sellerOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ 'items.seller': req.user!.id })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  res.json({ orders });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const isSellerInOrder = order.items.some((i) => String(i.seller) === req.user!.id);
  if (req.user!.role !== 'admin' && !isSellerInOrder) {
    throw ApiError.forbidden('You cannot update this order');
  }

  const next = req.body.status as OrderStatus;
  if (!transitions[order.status].includes(next)) {
    throw ApiError.badRequest(`Cannot move order from "${order.status}" to "${next}"`);
  }

  if (next === 'delivered' && order.paymentMethod === 'cod') {
    order.paymentStatus = 'paid';
  }
  if (next === 'cancelled') {
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }
  }
  order.status = next;
  await order.save();
  res.json({ order });
});

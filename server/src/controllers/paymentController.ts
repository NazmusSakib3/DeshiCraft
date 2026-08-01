import type { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  constructWebhookEvent,
  createCheckoutSession,
  isStripeConfigured,
} from '../services/stripeService.js';
import {
  initiatePayment,
  isSslcommerzConfigured,
  isValidSslStatus,
  validatePayment,
} from '../services/sslcommerzService.js';

async function loadPayableOrder(orderId: string, userId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.user) !== userId) throw ApiError.forbidden('Not your order');
  if (order.paymentStatus === 'paid') throw ApiError.badRequest('Order is already paid');
  if (order.status === 'cancelled') throw ApiError.badRequest('Order is cancelled');
  return order;
}

async function markOrderPaid(orderId: string, reference?: { stripeSessionId?: string; sslTranId?: string }) {
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === 'paid') return order;

  order.paymentStatus = 'paid';
  if (order.status === 'pending') order.status = 'confirmed';
  if (reference?.stripeSessionId) order.stripeSessionId = reference.stripeSessionId;
  if (reference?.sslTranId) order.sslTranId = reference.sslTranId;
  await order.save();
  return order;
}

async function processSslPayment(valId: string, tranId: string): Promise<void> {
  const validation = await validatePayment(valId);
  if (!isValidSslStatus(validation.status) || validation.tran_id !== tranId) {
    throw ApiError.badRequest('SSLCommerz payment validation failed');
  }

  const order = await Order.findOne({ orderNumber: tranId });
  if (!order) throw ApiError.notFound('Order not found for transaction');

  const paidAmount = Number(validation.amount);
  if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.total) > 0.01) {
    throw ApiError.badRequest('Payment amount mismatch');
  }

  await markOrderPaid(String(order._id), { sslTranId: tranId });
}

export const createStripeCheckout = asyncHandler(async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    throw ApiError.badRequest('Stripe payments are not configured on this server');
  }

  const { orderId } = req.body as { orderId: string };
  const order = await loadPayableOrder(orderId, req.user!.id);
  if (order.paymentMethod !== 'stripe') {
    throw ApiError.badRequest('This order does not use Stripe');
  }

  const user = await User.findById(req.user!.id).select('email');
  if (!user?.email) throw ApiError.badRequest('Customer email is required for card payment');

  const { url, sessionId } = await createCheckoutSession(order, user.email);
  order.stripeSessionId = sessionId;
  await order.save();

  res.json({ url });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    throw ApiError.badRequest('Missing Stripe signature');
  }

  const event = constructWebhookEvent(req.body as Buffer, signature);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === 'paid') {
      await markOrderPaid(orderId, { stripeSessionId: session.id });
    }
  }

  res.json({ received: true });
});

export const initiateSslcommerz = asyncHandler(async (req: Request, res: Response) => {
  if (!isSslcommerzConfigured()) {
    throw ApiError.badRequest('SSLCommerz payments are not configured on this server');
  }

  const { orderId } = req.body as { orderId: string };
  const order = await loadPayableOrder(orderId, req.user!.id);
  if (order.paymentMethod !== 'sslcommerz') {
    throw ApiError.badRequest('This order does not use SSLCommerz');
  }

  const user = await User.findById(req.user!.id).select('email');
  if (!user?.email) throw ApiError.badRequest('Customer email is required for online payment');

  const { gatewayUrl, tranId } = await initiatePayment(order, order.shippingAddress, user.email);
  order.sslTranId = tranId;
  await order.save();

  res.json({ url: gatewayUrl });
});

export const sslcommerzIpn = asyncHandler(async (req: Request, res: Response) => {
  const valId = String(req.body.val_id ?? req.query.val_id ?? '');
  const tranId = String(req.body.tran_id ?? req.query.tran_id ?? '');

  if (!valId || !tranId) {
    throw ApiError.badRequest('Missing SSLCommerz callback parameters');
  }

  try {
    await processSslPayment(valId, tranId);
    res.json({ status: 'ok' });
  } catch {
    res.status(400).json({ status: 'failed' });
  }
});

export const sslcommerzSuccess = asyncHandler(async (req: Request, res: Response) => {
  const valId = String(req.query.val_id ?? '');
  const tranId = String(req.query.tran_id ?? '');

  if (valId && tranId) {
    try {
      await processSslPayment(valId, tranId);
    } catch {
      // IPN may have already confirmed payment; redirect user either way.
    }
  }

  const order = tranId ? await Order.findOne({ orderNumber: tranId }) : null;
  const redirect = order
    ? `${env.clientUrl}/orders/${order._id}?payment=success`
    : `${env.clientUrl}/orders?payment=success`;
  res.redirect(redirect);
});

export const sslcommerzFail = asyncHandler(async (req: Request, res: Response) => {
  const tranId = String(req.query.tran_id ?? '');
  const order = tranId ? await Order.findOne({ orderNumber: tranId }) : null;
  const redirect = order
    ? `${env.clientUrl}/orders/${order._id}?payment=failed`
    : `${env.clientUrl}/orders?payment=failed`;
  res.redirect(redirect);
});

export const sslcommerzCancel = asyncHandler(async (req: Request, res: Response) => {
  const tranId = String(req.query.tran_id ?? '');
  const order = tranId ? await Order.findOne({ orderNumber: tranId }) : null;
  const redirect = order
    ? `${env.clientUrl}/orders/${order._id}?payment=cancelled`
    : `${env.clientUrl}/checkout?payment=cancelled`;
  res.redirect(redirect);
});

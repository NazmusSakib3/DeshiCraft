import Stripe from 'stripe';
import { env } from '../config/env.js';
import type { IOrder } from '../models/Order.js';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!env.stripe.secretKey) {
    throw new Error('Stripe is not configured');
  }
  stripeClient ??= new Stripe(env.stripe.secretKey);
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripe.secretKey);
}

export async function createCheckoutSession(
  order: IOrder,
  customerEmail: string,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: `DeshiCraft order ${order.orderNumber}`,
            description: `${order.items.length} item(s)`,
          },
          unit_amount: Math.round(order.total * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
    },
    success_url: `${env.clientUrl}/orders/${order._id}?payment=success`,
    cancel_url: `${env.clientUrl}/orders/${order._id}?payment=cancelled`,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return { url: session.url, sessionId: session.id };
}

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  if (!env.stripe.webhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, env.stripe.webhookSecret);
}

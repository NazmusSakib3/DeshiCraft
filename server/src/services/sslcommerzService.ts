import { env } from '../config/env.js';
import type { IOrder } from '../models/Order.js';
import type { Address } from '../models/User.js';

interface SslInitResponse {
  status?: string;
  failedreason?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
}

interface SslValidationResponse {
  status?: string;
  tran_id?: string;
  amount?: string | number;
  currency?: string;
  val_id?: string;
}

export function isSslcommerzConfigured(): boolean {
  return env.sslcommerz.isConfigured;
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export async function initiatePayment(
  order: IOrder,
  address: Address,
  customerEmail: string,
): Promise<{ gatewayUrl: string; tranId: string }> {
  const tranId = order.orderNumber;
  const payload: Record<string, string> = {
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: formatAmount(order.total),
    currency: 'BDT',
    tran_id: tranId,
    success_url: `${env.serverUrl}/api/payments/sslcommerz/success`,
    fail_url: `${env.serverUrl}/api/payments/sslcommerz/fail`,
    cancel_url: `${env.serverUrl}/api/payments/sslcommerz/cancel`,
    ipn_url: `${env.serverUrl}/api/payments/sslcommerz/ipn`,
    cus_name: address.fullName,
    cus_email: customerEmail,
    cus_phone: address.phone,
    cus_add1: address.street,
    cus_city: address.city,
    cus_state: address.district,
    cus_postcode: address.postalCode ?? '1000',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: `DeshiCraft order ${order.orderNumber}`,
    product_category: 'Handicraft',
    product_profile: 'general',
  };

  const res = await fetch(`${env.sslcommerz.apiBase}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload),
  });

  const text = await res.text();
  let data: SslInitResponse;
  try {
    data = JSON.parse(text) as SslInitResponse;
  } catch {
    throw new Error('SSLCommerz returned an invalid response');
  }
  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(data.failedreason ?? 'SSLCommerz payment initiation failed');
  }

  return { gatewayUrl: data.GatewayPageURL, tranId };
}

export async function validatePayment(valId: string): Promise<SslValidationResponse> {
  const params = new URLSearchParams({
    val_id: valId,
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    format: 'json',
  });

  const res = await fetch(
    `${env.sslcommerz.apiBase}/validator/api/validationserverAPI.php?${params.toString()}`,
  );
  return (await res.json()) as SslValidationResponse;
}

export function isValidSslStatus(status?: string): boolean {
  return status === 'VALID' || status === 'VALIDATED';
}

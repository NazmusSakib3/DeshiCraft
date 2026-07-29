import clsx from 'clsx';
import type { OrderStatus, PaymentStatus } from '../types';

const orderStyles: Record<OrderStatus, string> = {
  pending: 'bg-brass-300/25 text-brass-500',
  confirmed: 'bg-forest-100 text-forest-600',
  shipped: 'bg-clay-100 text-clay-600',
  delivered: 'bg-forest-500 text-white',
  cancelled: 'bg-ink/10 text-ink/50',
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: 'bg-clay-100 text-clay-600',
  paid: 'bg-forest-100 text-forest-600',
  refunded: 'bg-ink/10 text-ink/50',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={clsx('badge capitalize', orderStyles[status])}>{status}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={clsx('badge capitalize', paymentStyles[status])}>{status}</span>;
}

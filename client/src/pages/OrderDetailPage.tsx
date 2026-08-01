import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import type { Order, OrderStatus, PaymentMethod } from '../types';
import { formatBDT, formatDate } from '../lib/format';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import { PageLoader } from '../components/Spinner';

const steps: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'cod':
      return 'Cash on delivery';
    case 'stripe':
      return 'Card (Stripe)';
    case 'sslcommerz':
      return 'SSLCommerz';
    default:
      return method;
  }
}

function timelineLeftClass(index: number, currentStep: number): string {
  if (index === 0) return 'bg-transparent';
  if (index <= currentStep) return 'bg-forest-500';
  return 'bg-ink/10';
}

function timelineRightClass(index: number, currentStep: number, lastIndex: number): string {
  if (index === lastIndex) return 'bg-transparent';
  if (index < currentStep) return 'bg-forest-500';
  return 'bg-ink/10';
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<{ order: Order }>(`/orders/${id}`);
      return data.order;
    },
    enabled: !!id,
  });

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (!payment) return;

    if (payment === 'success') toast.success('Payment received. Thank you!');
    if (payment === 'failed') toast.error('Payment failed. You can try again from checkout.');
    if (payment === 'cancelled') toast('Payment cancelled.', { icon: 'ℹ️' });

    searchParams.delete('payment');
    setSearchParams(searchParams, { replace: true });
    void queryClient.invalidateQueries({ queryKey: ['order', id] });
  }, [searchParams, setSearchParams, queryClient, id]);

  const cancel = useMutation({
    mutationFn: async () => api.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success('Order cancelled');
      void queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (!order)
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink/60">Order not found.</p>
        <Link to="/orders" className="btn-primary mt-4">My orders</Link>
      </div>
    );

  const currentStep = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container-page py-10">
      <Link to="/orders" className="text-sm text-ink/50 hover:text-forest-500">
        &larr; Back to orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">{order.orderNumber}</h1>
          <p className="text-ink/50">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Timeline */}
      {!isCancelled ? (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={clsx('h-0.5 flex-1', timelineLeftClass(i, currentStep))} />
                  {i <= currentStep ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-forest-500" />
                  ) : (
                    <Circle className="h-6 w-6 shrink-0 text-ink/20" />
                  )}
                  <div className={clsx('h-0.5 flex-1', timelineRightClass(i, currentStep, steps.length - 1))} />
                </div>
                <span className={clsx('mt-2 text-xs font-medium capitalize', i <= currentStep ? 'text-forest-500' : 'text-ink/40')}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-clay-200 bg-clay-50 p-4 text-clay-700">
          This order was cancelled.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={`${item.title}-${item.image}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white p-4">
              <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-sm text-ink/50">
                  {formatBDT(item.price)} x {item.quantity}
                </p>
              </div>
              <span className="font-bold text-ink">{formatBDT(item.price * item.quantity)}</span>
            </div>
          ))}

          {['pending', 'confirmed'].includes(order.status) && (
            <button type="button"
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="btn-outline text-clay-600"
            >
              Cancel order
            </button>
          )}
        </div>

        {/* Summary + address */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
              <MapPin className="h-4 w-4 text-forest-500" /> Delivery to
            </h3>
            <div className="text-sm text-ink/70">
              <p className="font-medium text-ink">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.district}{' '}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd>{formatBDT(order.itemstotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Shipping</dt>
                <dd>{formatBDT(order.shippingfee)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/8 pt-2 text-base font-bold">
                <dt className="text-ink">Total</dt>
                <dd className="text-forest-500">{formatBDT(order.total)}</dd>
              </div>
              <p className="pt-2 text-xs uppercase tracking-wide text-ink/40">
                Payment: {paymentMethodLabel(order.paymentMethod)}
              </p>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

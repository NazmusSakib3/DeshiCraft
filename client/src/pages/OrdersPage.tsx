import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { api } from '../lib/api';
import type { Order } from '../types';
import { formatBDT, formatDate } from '../lib/format';
import { OrderStatusBadge } from '../components/StatusBadge';
import { PageLoader } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<{ orders: Order[] }>('/orders/mine');
      return data.orders;
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-4xl font-bold text-ink">My orders</h1>
      {!orders || orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order it will show up here."
          action={
            <Link to="/shop" className="btn-primary">
              Browse the market
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-white p-5 transition hover:shadow-soft"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt=""
                      className="h-12 w-12 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-ink">{order.orderNumber}</p>
                  <p className="text-sm text-ink/50">
                    {formatDate(order.createdAt)} - {order.items.length} item(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-bold text-ink">{formatBDT(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import type { Order, OrderStatus } from '../../types';
import { formatBDT, formatDate } from '../../lib/format';
import { DashboardNav } from '../../components/DashboardNav';
import { OrderStatusBadge } from '../../components/StatusBadge';
import { PageLoader } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { sellerTabs } from './sellerTabs';

const nextStatus: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  pending: { to: 'confirmed', label: 'Confirm' },
  confirmed: { to: 'shipped', label: 'Mark shipped' },
  shipped: { to: 'delivered', label: 'Mark delivered' },
};

export default function SellerOrders() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller', 'orders'],
    queryFn: async () => {
      const { data } = await api.get<{ orders: Order[] }>('/orders/seller');
      return data.orders;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Order updated');
      void queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['seller', 'dashboard'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Seller dashboard" tabs={sellerTabs} />
      <h2 className="mb-6 text-xl font-bold text-ink">Incoming orders</h2>

      {isLoading ? (
        <PageLoader />
      ) : !orders || orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders yet" description="Orders containing your products will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const myItems = order.items.filter((i) => String(i.seller) === user?.id);
            const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const action = nextStatus[order.status];
            return (
              <div key={order._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{order.orderNumber}</p>
                    <p className="text-sm text-ink/50">
                      {formatDate(order.createdAt)} -{' '}
                      {typeof order.user === 'object' ? order.user.name : 'Customer'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    {action && (
                      <button
                        onClick={() => updateStatus.mutate({ id: order._id, status: action.to })}
                        disabled={updateStatus.isPending}
                        className="btn-primary text-sm"
                      >
                        {action.label}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-ink/8 pt-4">
                  {myItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="flex-1 text-ink/70">
                        {item.title} <span className="text-ink/40">x{item.quantity}</span>
                      </span>
                      <span className="font-medium">{formatBDT(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-sm font-semibold">
                    <span>Your earnings from this order</span>
                    <span className="text-forest-500">{formatBDT(myTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

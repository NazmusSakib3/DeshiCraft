import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Order, OrderStatus } from '../../types';
import { formatBDT, formatDate } from '../../lib/format';
import { DashboardNav } from '../../components/DashboardNav';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/StatusBadge';
import { PageLoader } from '../../components/Spinner';
import { adminTabs } from './adminTabs';

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

const statuses: (OrderStatus | '')[] = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status, page],
    queryFn: async () => {
      const { data } = await api.get<OrdersResponse>('/admin/orders', { params: { status, page } });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Admin dashboard" tabs={adminTabs} />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Orders {data && `(${data.total})`}</h2>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input max-w-[180px] capitalize"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s ? s : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {(data?.orders ?? []).map((order) => (
                  <tr key={order._id} className="hover:bg-paper/50">
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="font-medium text-forest-500 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {typeof order.user === 'object' ? order.user.name : '-'}
                    </td>
                    <td className="px-4 py-3 text-ink/50">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{formatBDT(order.total)}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline">
                Previous
              </button>
              <span className="px-3 text-sm text-ink/60">
                Page {data.page} of {data.totalPages}
              </span>
              <button type="button" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

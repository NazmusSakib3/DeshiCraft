import { useQuery } from '@tanstack/react-query';
import { Coins, Package, ShoppingCart, Store, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { formatBDT } from '../../lib/format';
import { DashboardNav, StatCard } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { adminTabs } from './adminTabs';

interface AdminData {
  stats: {
    userCount: number;
    sellerCount: number;
    productCount: number;
    orderCount: number;
    revenue: number;
    statusCounts: Record<string, number>;
  };
  daily: { _id: string; count: number; revenue: number }[];
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<AdminData>('/admin/stats');
      return data;
    },
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Admin dashboard" tabs={adminTabs} />

      {isLoading || !data ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Revenue" value={formatBDT(data.stats.revenue)} icon={Coins} />
            <StatCard label="Orders" value={data.stats.orderCount} icon={ShoppingCart} />
            <StatCard label="Products" value={data.stats.productCount} icon={Package} />
            <StatCard label="Sellers" value={data.stats.sellerCount} icon={Store} />
            <StatCard label="Users" value={data.stats.userCount} icon={Users} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="mb-4 font-bold text-ink">Orders (last 7 days)</h2>
              <DailyChart daily={data.daily} />
            </div>
            <div className="card p-6">
              <h2 className="mb-4 font-bold text-ink">Orders by status</h2>
              <div className="space-y-3">
                {Object.entries(data.stats.statusCounts).length === 0 ? (
                  <p className="text-sm text-ink/50">No orders yet.</p>
                ) : (
                  Object.entries(data.stats.statusCounts).map(([status, count]) => (
                    <div key={status}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="capitalize text-ink/70">{status}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink/8">
                        <div
                          className="h-full rounded-full bg-forest-500"
                          style={{ width: `${(count / data.stats.orderCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DailyChart({ daily }: { daily: { _id: string; count: number; revenue: number }[] }) {
  if (daily.length === 0) return <p className="text-sm text-ink/50">No recent orders.</p>;
  const max = Math.max(...daily.map((d) => d.count), 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {daily.map((d) => (
        <div key={d._id} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-forest-400 transition-all"
              style={{ height: `${(d.count / max) * 100}%` }}
              title={`${d.count} orders`}
            />
          </div>
          <span className="text-[10px] text-ink/40">{d._id.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

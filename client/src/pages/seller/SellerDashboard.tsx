import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Boxes, Coins, Package, ShoppingCart } from 'lucide-react';
import { api } from '../../lib/api';
import { formatBDT } from '../../lib/format';
import { DashboardNav, StatCard } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { useAuthStore } from '../../store/authStore';
import { sellerTabs } from './sellerTabs';

interface DashboardData {
  stats: {
    productCount: number;
    activeCount: number;
    orderCount: number;
    revenue: number;
    unitsSold: number;
    statusCounts: Record<string, number>;
  };
  lowStock: { _id: string; title: string; stock: number }[];
}

export default function SellerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardData>('/seller/dashboard');
      return data;
    },
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Seller dashboard" tabs={sellerTabs} />

      {user?.sellerProfile && !user.sellerProfile.approved && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-brass-300 bg-brass-300/15 px-4 py-3 text-sm text-brass-500">
          <AlertTriangle className="h-4 w-4" />
          Your shop is pending admin verification. You can still list products.
        </div>
      )}

      {isLoading || !data ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatBDT(data.stats.revenue)} icon={Coins} hint="Excludes cancelled" />
            <StatCard label="Orders" value={data.stats.orderCount} icon={ShoppingCart} />
            <StatCard label="Units sold" value={data.stats.unitsSold} icon={Boxes} />
            <StatCard label="Products" value={`${data.stats.activeCount}/${data.stats.productCount}`} icon={Package} hint="Active / total" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="mb-4 font-bold text-ink">Orders by status</h2>
              <div className="space-y-3">
                {Object.entries(data.stats.statusCounts).length === 0 ? (
                  <p className="text-sm text-ink/50">No orders yet.</p>
                ) : (
                  Object.entries(data.stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-ink/70">{status}</span>
                      <span className="font-semibold text-ink">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-ink">Low stock alert</h2>
                <Link to="/seller/products" className="text-sm text-forest-500 hover:underline">
                  Manage
                </Link>
              </div>
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-ink/50">All products are well stocked.</p>
              ) : (
                <div className="space-y-2">
                  {data.lowStock.map((p) => (
                    <div key={p._id} className="flex items-center justify-between text-sm">
                      <span className="text-ink/70">{p.title}</span>
                      <span className="badge bg-clay-100 text-clay-600">{p.stock} left</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

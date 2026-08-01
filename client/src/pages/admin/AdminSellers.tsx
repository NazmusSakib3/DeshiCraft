import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import type { SellerProfile } from '../../types';
import { DashboardNav } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { adminTabs } from './adminTabs';

interface AdminSeller {
  _id: string;
  name: string;
  email: string;
  sellerProfile?: SellerProfile;
}

export default function AdminSellers() {
  const queryClient = useQueryClient();

  const { data: sellers, isLoading } = useQuery({
    queryKey: ['admin', 'sellers'],
    queryFn: async () => {
      const { data } = await api.get<{ sellers: AdminSeller[] }>('/admin/sellers');
      return data.sellers;
    },
  });

  const approve = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) =>
      api.patch(`/admin/sellers/${id}/approve`, { approved }),
    onSuccess: () => {
      toast.success('Seller updated');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Admin dashboard" tabs={adminTabs} />
      <h2 className="mb-6 text-xl font-bold text-ink">Sellers</h2>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(sellers ?? []).map((seller) => (
            <div key={seller._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {seller.sellerProfile?.shopName ?? seller.name}
                    {seller.sellerProfile?.approved && <BadgeCheck className="h-4 w-4 text-forest-500" />}
                  </p>
                  <p className="text-sm text-ink/50">{seller.email}</p>
                  {seller.sellerProfile?.region && (
                    <p className="text-xs text-ink/40">{seller.sellerProfile.region}</p>
                  )}
                </div>
                <span
                  className={`badge ${
                    seller.sellerProfile?.approved ? 'bg-forest-100 text-forest-600' : 'bg-brass-300/25 text-brass-500'
                  }`}
                >
                  {seller.sellerProfile?.approved ? 'Verified' : 'Pending'}
                </span>
              </div>
              {seller.sellerProfile?.bio && (
                <p className="mt-3 text-sm text-ink/60">{seller.sellerProfile.bio}</p>
              )}
              <div className="mt-4">
                {seller.sellerProfile?.approved ? (
                  <button type="button"
              onClick={() => approve.mutate({ id: seller._id, approved: false })}
                    className="btn-outline text-sm"
                  >
                    Revoke verification
                  </button>
                ) : (
                  <button type="button"
              onClick={() => approve.mutate({ id: seller._id, approved: true })}
                    className="btn-primary text-sm"
                  >
                    Verify seller
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

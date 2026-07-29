import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import type { Product } from '../../types';
import { formatBDT } from '../../lib/format';
import { DashboardNav } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import { sellerTabs } from './sellerTabs';

export default function SellerProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['seller', 'products'],
    queryFn: async () => {
      const { data } = await api.get<{ items: Product[] }>('/products/mine');
      return data.items;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      void queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Seller dashboard" tabs={sellerTabs} />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">My products</h2>
        <Link to="/seller/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !products || products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first handmade product to start selling."
          action={
            <Link to="/seller/products/new" className="btn-primary">
              Add product
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-ink">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatBDT(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 3 ? 'text-clay-600' : ''}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'bg-forest-100 text-forest-600' : 'bg-ink/10 text-ink/50'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/seller/products/${p._id}/edit`} className="btn-ghost !px-2" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${p.title}"?`)) remove.mutate(p._id);
                        }}
                        className="btn-ghost !px-2 text-clay-500"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

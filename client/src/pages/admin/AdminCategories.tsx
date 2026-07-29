import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import type { Category } from '../../types';
import { DashboardNav } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { adminTabs } from './adminTabs';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>('/categories');
      return data.categories;
    },
  });

  const create = useMutation({
    mutationFn: async () => api.post('/categories', { name, description, imageUrl }),
    onSuccess: () => {
      toast.success('Category created');
      setName('');
      setDescription('');
      setImageUrl('');
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <div className="container-page py-10">
      <DashboardNav title="Admin dashboard" tabs={adminTabs} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-4 text-xl font-bold text-ink">Categories</h2>
          {isLoading ? (
            <PageLoader />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(categories ?? []).map((cat) => (
                <div key={cat._id} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-3">
                  <img src={cat.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{cat.name}</p>
                    <p className="line-clamp-1 text-xs text-ink/50">{cat.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${cat.name}"?`)) remove.mutate(cat._id);
                    }}
                    className="text-ink/40 hover:text-clay-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
          className="h-fit card p-6"
        >
          <h2 className="mb-4 text-lg font-bold text-ink">Add category</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input" />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="input" />
            </div>
            <button disabled={create.isPending} className="btn-primary w-full">
              <Plus className="h-4 w-4" /> Create category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

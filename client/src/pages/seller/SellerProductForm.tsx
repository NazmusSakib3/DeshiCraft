import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import type { Category, Product } from '../../types';
import { DashboardNav } from '../../components/DashboardNav';
import { PageLoader } from '../../components/Spinner';
import { sellerTabs } from './sellerTabs';

interface FormState {
  title: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  stock: string;
  material: string;
  region: string;
  tags: string;
  images: string[];
  isActive: boolean;
}

const initial: FormState = {
  title: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: '',
  stock: '0',
  material: '',
  region: '',
  tags: '',
  images: [''],
  isActive: true,
};

export default function SellerProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>('/categories');
      return data.categories;
    },
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ['seller', 'product', id],
    queryFn: async () => {
      const { data } = await api.get<{ items: Product[] }>('/products/mine');
      return data.items.find((p) => p._id === id) ?? null;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description,
        price: String(existing.price),
        compareAtPrice: existing.compareAtPrice ? String(existing.compareAtPrice) : '',
        category: typeof existing.category === 'object' ? existing.category._id : existing.category,
        stock: String(existing.stock),
        material: existing.material ?? '',
        region: existing.region ?? '',
        tags: existing.tags.join(', '),
        images: existing.images.length ? existing.images : [''],
        isActive: existing.isActive,
      });
    }
  }, [existing]);

  useEffect(() => {
    if (categories && categories.length && !form.category) {
      setForm((f) => ({ ...f, category: categories[0]._id }));
    }
  }, [categories, form.category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images.map((i) => i.trim()).filter(Boolean);
    if (images.length === 0) {
      toast.error('Add at least one image URL');
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      category: form.category,
      stock: Number(form.stock),
      material: form.material || undefined,
      region: form.region || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images,
      ...(isEdit ? { isActive: form.isActive } : {}),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      navigate('/seller/products');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) return <PageLoader />;

  const setImage = (index: number, value: string) =>
    setForm((f) => ({ ...f, images: f.images.map((img, i) => (i === index ? value : img)) }));

  return (
    <div className="container-page py-10">
      <DashboardNav title="Seller dashboard" tabs={sellerTabs} />
      <h2 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit product' : 'New product'}</h2>

      <form onSubmit={submit} className="grid max-w-3xl gap-5">
        <div>
          <label className="label">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            minLength={2}
            className="input"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            minLength={10}
            rows={4}
            className="input"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label">Price (BDT)</label>
            <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="input" />
          </div>
          <div>
            <label className="label">Compare-at price</label>
            <input type="number" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="input" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="input">
              {(categories ?? []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Material</label>
            <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Region</label>
            <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Tags (comma separated)</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="handmade, gift, eco" />
        </div>

        <div>
          <label className="label">Image URLs</label>
          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={img}
                  onChange={(e) => setImage(i, e.target.value)}
                  placeholder="https://..."
                  className="input"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                    className="btn-outline !px-3"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, images: [...f.images, ''] }))}
            className="btn-ghost mt-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Add another image
          </button>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-ink/30"
            />
            Product is active and visible in the shop
          </label>
        )}

        <div className="flex gap-3">
          <button disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" onClick={() => navigate('/seller/products')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

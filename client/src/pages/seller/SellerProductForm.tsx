import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiError } from '../../lib/api';
import type { Category, Product } from '../../types';
import { DashboardNav } from '../../components/DashboardNav';
import { ProductImagesField } from '../../components/ProductImagesField';
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
  images: [],
  isActive: true,
};

function parseTags(raw: string): string[] {
  if (!raw) return [];
  return raw.split(',').map((t) => t.trim()).filter(Boolean);
}

function saveProductLabel(saving: boolean, isEdit: boolean): string {
  if (saving) return 'Saving...';
  if (isEdit) return 'Save changes';
  return 'Create product';
}

async function fetchSellerProduct(id: string): Promise<Product | null> {
  const { data } = await api.get<{ items: Product[] }>('/products/mine');
  return data.items.find((p) => p._id === id) ?? null;
}

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
    queryFn: () => fetchSellerProduct(id!),
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
        images: existing.images.length ? existing.images : [],
        isActive: existing.isActive,
      });
    }
  }, [existing]);

  useEffect(() => {
    if (categories?.length && !form.category) {
      setForm((f) => ({ ...f, category: categories[0]._id }));
    }
  }, [categories, form.category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images.map((i) => i.trim()).filter(Boolean);
    if (images.length === 0) {
      toast.error('Add at least one product image');
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
      tags: parseTags(form.tags),
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

  const updateImages = (images: string[]) => setForm((f) => ({ ...f, images }));

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <div className="container-page py-10">
      <DashboardNav title="Seller dashboard" tabs={sellerTabs} />
      <h2 className="mb-6 text-xl font-bold text-ink">{isEdit ? 'Edit product' : 'New product'}</h2>

      <form onSubmit={submit} className="grid max-w-3xl gap-5">
        <div>
          <label className="label" htmlFor="product-title">Title</label>
          <input
            id="product-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            minLength={2}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
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
            <label className="label" htmlFor="product-price">Price (BDT)</label>
            <input id="product-price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="product-compareAtPrice">Compare-at price</label>
            <input id="product-compareAtPrice" type="number" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="product-stock">Stock</label>
            <input id="product-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="input" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="product-category">Category</label>
            <select id="product-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="input">
              {(categories ?? []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="product-material">Material</label>
            <input id="product-material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="product-region">Region</label>
            <input id="product-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="product-tags">Tags (comma separated)</label>
          <input id="product-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="handmade, gift, eco" />
        </div>

        <div>
          <label className="label" htmlFor="product-images-upload">Product images</label>
          <ProductImagesField
            uploadInputId="product-images-upload"
            images={form.images}
            onChange={updateImages}
          />
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-ink/30"
            />
            <span>Product is active and visible in the shop</span>
          </label>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saveProductLabel(saving, isEdit)}
          </button>
          <button type="button" onClick={() => navigate('/seller/products')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

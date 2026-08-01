import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import { api } from '../lib/api';
import type { Category, Paginated, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most reviewed' },
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();

  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Number(params.get('page') ?? 1);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>('/categories');
      return data.categories;
    },
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { search, category, sort, page }],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Product>>('/products', {
        params: { search, category, sort, page, limit: 12 },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-ink">
          {search ? `Results for "${search}"` : 'The Market'}
        </h1>
        <p className="mt-1 text-ink/60">
          {data ? `${data.total} handmade pieces` : 'Discovering handmade pieces...'}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="space-y-6">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink/60">
              <SlidersHorizontal className="h-4 w-4" /> Categories
            </h3>
            <div className="flex flex-col gap-1">
              <button type="button"
              onClick={() => update('category', '')}
                className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                  !category ? 'bg-forest-500 text-white' : 'hover:bg-ink/5'
                }`}
              >
                All crafts
              </button>
              {(categories ?? []).map((cat) => (
                <button type="button"
                  key={cat._id}
                  onClick={() => update('category', cat.slug)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                    category === cat.slug ? 'bg-forest-500 text-white' : 'hover:bg-ink/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="text-sm text-ink/50">
              {isFetching && <Spinner className="inline h-4 w-4 text-forest-500" />}
            </div>
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
              className="input max-w-[200px]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Spinner className="h-8 w-8 text-forest-500" />
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {data.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button type="button"
                    disabled={page <= 1}
                    onClick={() => update('page', String(page - 1))}
                    className="btn-outline"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-ink/60">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => update('page', String(page + 1))}
                    className="btn-outline"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try a different search term or category filter."
            />
          )}
        </div>
      </div>
    </div>
  );
}

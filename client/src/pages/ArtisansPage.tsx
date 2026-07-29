import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Store } from 'lucide-react';
import { api } from '../lib/api';
import type { Paginated, Product } from '../types';
import { PageLoader } from '../components/Spinner';

interface Artisan {
  id: string;
  name: string;
  shopName: string;
  region?: string;
  bio?: string;
  productCount: number;
}

export default function ArtisansPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'all-for-artisans'],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Product>>('/products', { params: { limit: 48 } });
      return data.items;
    },
  });

  if (isLoading) return <PageLoader />;

  const artisanMap = new Map<string, Artisan>();
  for (const p of products ?? []) {
    if (typeof p.seller !== 'object') continue;
    const id = p.seller._id;
    const existing = artisanMap.get(id);
    if (existing) {
      existing.productCount += 1;
    } else {
      artisanMap.set(id, {
        id,
        name: p.seller.name,
        shopName: p.seller.sellerProfile?.shopName ?? p.seller.name,
        region: p.seller.sellerProfile?.region ?? p.region,
        bio: p.seller.sellerProfile?.bio,
        productCount: 1,
      });
    }
  }
  const artisans = [...artisanMap.values()];

  return (
    <div>
      <section className="border-b border-ink/8 bg-forest-500 py-16 text-white">
        <div className="container-page">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Meet the makers</h1>
          <p className="mt-3 max-w-xl text-paper/80">
            The hands behind every DeshiCraft piece - potters, weavers and metalsmiths keeping
            Bangladeshi craft traditions alive.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artisans.map((artisan) => (
            <div key={artisan.id} className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-500">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{artisan.shopName}</h3>
                  {artisan.region && (
                    <p className="flex items-center gap-1 text-xs text-ink/50">
                      <MapPin className="h-3 w-3" /> {artisan.region}
                    </p>
                  )}
                </div>
              </div>
              {artisan.bio && <p className="mt-4 text-sm text-ink/60">{artisan.bio}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="badge bg-clay-50 text-clay-600">{artisan.productCount} products</span>
                <Link to={`/shop?search=${encodeURIComponent(artisan.shopName)}`} className="text-sm font-semibold text-forest-500 hover:underline">
                  View shop
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { PageLoader } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useWishlistStore } from '../store/wishlistStore';

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);

  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist', ids.length],
    queryFn: async () => {
      const { data } = await api.get<{ items: Product[] }>('/users/wishlist');
      return data.items;
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-4xl font-bold text-ink">Your wishlist</h1>
      {!items || items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Tap the heart on any product to save it here."
          action={
            <Link to="/shop" className="btn-primary">
              Find something you love
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { formatBDT } from '../lib/format';
import { Rating } from './Rating';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { apiError } from '../lib/api';

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const wished = useWishlistStore((s) => s.ids.includes(product._id));
  const toggle = useWishlistStore((s) => s.toggle);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Sign in to save favourites');
      return;
    }
    try {
      const added = await toggle(product._id);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    add(product);
    toast.success('Added to cart');
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-16px_rgba(28,35,29,0.28)]"
    >
      <div className="relative aspect-square overflow-hidden bg-clay-50">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 badge bg-clay-500 text-white">-{discount}%</span>
        )}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink/60 shadow transition hover:text-clay-500"
        >
          <Heart className={clsx('h-4 w-4', wished && 'fill-clay-500 text-clay-500')} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="badge bg-white text-ink">Sold out</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.region && (
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-forest-500">
            {product.region}
          </span>
        )}
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
          {product.title}
        </h3>
        <div className="mt-1">
          <Rating value={product.ratingAverage} count={product.ratingCount} />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-ink">{formatBDT(product.price)}</span>
            {discount > 0 && (
              <span className="ml-2 text-sm text-ink/40 line-through">
                {formatBDT(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-500 text-white transition hover:bg-forest-600 disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

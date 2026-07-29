import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Minus, Plus, ShoppingBag, Store } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import type { Product, Review } from '../types';
import { formatBDT, timeAgo } from '../lib/format';
import { Rating } from '../components/Rating';
import { PageLoader } from '../components/Spinner';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const wished = useWishlistStore((s) => (slug ? s.ids : []));
  const toggleWish = useWishlistStore((s) => s.toggle);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get<{ product: Product }>(`/products/${slug}`);
      return data.product;
    },
    enabled: !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: async () => {
      const { data } = await api.get<{ reviews: Review[] }>(`/products/${slug}/reviews`);
      return data.reviews;
    },
    enabled: !!slug,
  });

  if (isLoading) return <PageLoader />;
  if (!product)
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink/60">Product not found.</p>
        <Link to="/shop" className="btn-primary mt-4">Back to shop</Link>
      </div>
    );

  const seller = typeof product.seller === 'object' ? product.seller : null;
  const isWished = wished.includes(product._id);

  const handleWishlist = async () => {
    if (!user) return toast.error('Sign in to save favourites');
    try {
      const added = await toggleWish(product._id);
      toast.success(added ? 'Added to wishlist' : 'Removed');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="container-page py-10">
      <nav className="mb-6 text-sm text-ink/50">
        <Link to="/shop" className="hover:text-forest-500">Shop</Link> / {product.title}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-clay-50">
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={clsx(
                    'h-20 w-20 overflow-hidden rounded-xl border-2',
                    i === activeImage ? 'border-forest-500' : 'border-transparent',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.region && (
            <span className="text-sm font-semibold uppercase tracking-wide text-forest-500">
              {product.region}
            </span>
          )}
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.ratingAverage} count={product.ratingCount} size={18} />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">{formatBDT(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-ink/40 line-through">
                {formatBDT(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-ink/70">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {product.material && (
              <div className="rounded-xl bg-white p-3 shadow-soft">
                <dt className="text-ink/50">Material</dt>
                <dd className="font-medium text-ink">{product.material}</dd>
              </div>
            )}
            <div className="rounded-xl bg-white p-3 shadow-soft">
              <dt className="text-ink/50">Availability</dt>
              <dd className="font-medium text-ink">
                {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
              </dd>
            </div>
          </dl>

          {seller && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-ink/8 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-500">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink/50">Sold by</p>
                <p className="font-semibold text-ink">
                  {seller.sellerProfile?.shopName ?? seller.name}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15 bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-ink/60 hover:text-ink"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-ink/60 hover:text-ink"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              disabled={product.stock === 0}
              onClick={() => {
                add(product, qty);
                toast.success('Added to cart');
              }}
              className="btn-primary flex-1 text-base"
            >
              <ShoppingBag className="h-5 w-5" /> Add to cart
            </button>
            <button onClick={handleWishlist} className="btn-outline h-11 w-11 !px-0" aria-label="Wishlist">
              <Heart className={clsx('h-5 w-5', isWished && 'fill-clay-500 text-clay-500')} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection slug={slug!} reviews={reviews ?? []} />
    </div>
  );
}

function ReviewSection({ slug, reviews }: { slug: string; reviews: Review[] }) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(`/products/${slug}/reviews`, { rating, comment });
    },
    onSuccess: () => {
      toast.success('Review posted');
      setComment('');
      void queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      void queryClient.invalidateQueries({ queryKey: ['product', slug] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <section className="mt-16 border-t border-ink/8 pt-10">
      <h2 className="text-2xl font-bold text-ink">Customer reviews</h2>

      {user && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-6 card p-5"
        >
          <p className="label">Your rating</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={clsx('text-2xl', star <= rating ? 'text-brass-400' : 'text-ink/20')}
              >
                *
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={3}
            rows={3}
            placeholder="Share your experience with this product..."
            className="input"
          />
          <button disabled={mutation.isPending} className="btn-primary mt-3">
            {mutation.isPending ? 'Posting...' : 'Post review'}
          </button>
          <p className="mt-2 text-xs text-ink/50">
            You can only review products you have purchased.
          </p>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-ink/50">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{review.user.name}</p>
                <span className="text-xs text-ink/40">{timeAgo(review.createdAt)}</span>
              </div>
              <Rating value={review.rating} className="mt-1" />
              <p className="mt-2 text-ink/70">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

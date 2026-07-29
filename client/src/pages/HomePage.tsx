import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../lib/api';
import type { Category, Paginated, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';

export default function HomePage() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Product>>('/products', {
        params: { limit: 8, sort: 'rating' },
      });
      return data.items;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>('/categories');
      return data.categories;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000"
          alt="Bangladeshi artisan pottery"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-700/90 via-forest-700/70 to-ink/40" />
        <div className="container-page relative flex min-h-[88vh] flex-col justify-center py-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brass-300 ring-1 ring-white/20">
              <Leaf className="h-4 w-4" /> Handmade across Bangladesh
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl md:text-7xl">
              Deshi<span className="text-brass-300">Craft</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">
              Bring home the work of local potters, weavers and metalsmiths - bought directly
              from the artisans who make each piece by hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-accent text-base">
                Explore the market <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/sell"
                className="btn text-base text-white ring-1 ring-white/30 hover:bg-white/10"
              >
                Sell your craft
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-ink/8 bg-white">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: 'Nationwide delivery', text: 'Cash on delivery across all 64 districts.' },
            { icon: ShieldCheck, title: 'Verified artisans', text: 'Every seller is reviewed before they list.' },
            { icon: Leaf, title: 'Sustainably made', text: 'Natural materials, low-waste workshops.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-ink">Browse by craft</h2>
            <p className="mt-1 text-ink/60">Traditions passed down through generations.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {(categories ?? []).map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold leading-tight text-white">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-ink">Top rated pieces</h2>
            <p className="mt-1 text-ink/60">Loved by our community of buyers.</p>
          </div>
          <Link to="/shop" className="btn-ghost hidden text-forest-500 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7 text-forest-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(featured ?? []).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Seller CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-forest-500 px-8 py-14 text-center text-white sm:px-16">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brass-400/20" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-clay-400/20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Are you a maker?</h2>
            <p className="mt-3 text-paper/80">
              Open a shop on DeshiCraft and reach buyers who care about handmade quality. No
              upfront fees.
            </p>
            <Link to="/sell" className="btn-accent mt-6 text-base">
              Start selling today <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatBDT } from '../lib/format';
import { EmptyState } from '../components/EmptyState';

const SHIPPING_FEE = 60;

export default function CartPage() {
  const { lines, setQuantity, remove, subtotal } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const sub = subtotal();

  if (lines.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="mb-8 text-4xl font-bold text-ink">Your cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the market and add some handmade treasures."
          action={
            <Link to="/shop" className="btn-primary">
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  const checkout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-4xl font-bold text-ink">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {lines.map((line) => (
            <div key={line.productId} className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-4">
              <Link to={`/product/${line.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-clay-50">
                <img src={line.image} alt={line.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/product/${line.slug}`} className="font-semibold text-ink hover:text-forest-500">
                    {line.title}
                  </Link>
                  <button onClick={() => remove(line.productId)} className="text-ink/40 hover:text-clay-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-ink/50">{formatBDT(line.price)} each</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink/60"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink/60"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-ink">{formatBDT(line.price * line.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit card p-6">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="font-medium">{formatBDT(sub)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="font-medium">{formatBDT(SHIPPING_FEE)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-ink/8 pt-3 text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-forest-500">{formatBDT(sub + SHIPPING_FEE)}</dd>
            </div>
          </dl>
          <button onClick={checkout} className="btn-primary mt-5 w-full">
            Proceed to checkout
          </button>
          <Link to="/shop" className="btn-ghost mt-2 w-full">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

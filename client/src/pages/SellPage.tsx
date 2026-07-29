import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function SellPage() {
  const user = useAuthStore((s) => s.user);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('');
  const [region, setRegion] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && (user.role === 'seller' || user.role === 'admin')) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-forest-500" />
        <h1 className="mt-4 text-3xl font-bold text-ink">You are already a seller</h1>
        <p className="mt-2 text-ink/60">Head to your dashboard to manage products and orders.</p>
        <Link to="/seller" className="btn-primary mt-6">
          Go to seller dashboard
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/sell' } });
      return;
    }
    setLoading(true);
    try {
      await api.post('/seller/apply', { shopName, region, bio });
      await bootstrap();
      toast.success('Your shop is live! Awaiting admin verification.');
      navigate('/seller');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-clay-500 py-16 text-white">
        <div className="container-page">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Sell your craft</h1>
          <p className="mt-3 max-w-xl text-white/85">
            Reach thousands of buyers who value handmade quality. Open your DeshiCraft shop in
            minutes - no listing fees.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-ink">Why sell on DeshiCraft?</h2>
          {[
            ['Direct to buyers', 'Keep more of every sale by selling straight to customers.'],
            ['Simple dashboard', 'List products, track stock and manage orders in one place.'],
            ['Nationwide reach', 'We handle discovery so your craft reaches all 64 districts.'],
          ].map(([title, text]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-forest-500" />
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink/60">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="h-fit card p-6">
          <h2 className="text-lg font-bold text-ink">Open your shop</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Shop name</label>
              <input value={shopName} onChange={(e) => setShopName(e.target.value)} required minLength={2} className="input" placeholder="e.g. Rina Terracotta Studio" />
            </div>
            <div>
              <label className="label">Region</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)} className="input" placeholder="e.g. Rajshahi" />
            </div>
            <div>
              <label className="label">About your craft</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input" placeholder="Tell buyers your story..." />
            </div>
            <button disabled={loading} className="btn-accent w-full">
              {loading ? 'Creating shop...' : user ? 'Open my shop' : 'Sign in to continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

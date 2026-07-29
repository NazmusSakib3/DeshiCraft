import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Plus, Store, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import type { Address } from '../types';
import { useAuthStore } from '../store/authStore';
import { DistrictSelect } from '../components/DistrictSelect';

const emptyAddress: Address = { fullName: '', phone: '', street: '', city: '', district: '', postalCode: '' };

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Address>(emptyAddress);
  const [showForm, setShowForm] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get<{ addresses: Address[] }>('/users/addresses');
      return data.addresses;
    },
  });

  const addAddress = useMutation({
    mutationFn: async () => api.post('/users/addresses', form),
    onSuccess: () => {
      toast.success('Address added');
      setForm(emptyAddress);
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const deleteAddress = useMutation({
    mutationFn: async (addressId: string) => api.delete(`/users/addresses/${addressId}`),
    onSuccess: () => {
      toast.success('Address removed');
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-4xl font-bold text-ink">My account</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Profile */}
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Profile</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-500 text-2xl font-bold text-brass-300">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">{user?.name}</p>
                <p className="text-ink/60">{user?.email}</p>
                <span className="badge mt-1 bg-forest-50 capitalize text-forest-600">{user?.role}</span>
              </div>
            </div>
          </section>

          {/* Addresses */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Saved addresses</h2>
              <button onClick={() => setShowForm((v) => !v)} className="btn-outline text-sm">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddress.mutate();
                }}
                className="mb-5 grid gap-3 rounded-xl bg-paper p-4 sm:grid-cols-2"
              >
                <input value={form.fullName} onChange={set('fullName')} required placeholder="Full name" className="input sm:col-span-2" />
                <input value={form.phone} onChange={set('phone')} required placeholder="Phone" className="input" />
                <div>
                  <label className="label">District</label>
                  <DistrictSelect
                    value={form.district}
                    onChange={(district) => setForm((f) => ({ ...f, district }))}
                    required
                  />
                </div>
                <input value={form.street} onChange={set('street')} required placeholder="Street address" className="input sm:col-span-2" />
                <input value={form.city} onChange={set('city')} required placeholder="City / Area" className="input" />
                <input value={form.postalCode ?? ''} onChange={set('postalCode')} placeholder="Postal code" className="input" />
                <button disabled={addAddress.isPending} className="btn-primary sm:col-span-2">
                  Save address
                </button>
              </form>
            )}

            <div className="space-y-3">
              {(addresses ?? []).length === 0 ? (
                <p className="text-sm text-ink/50">No saved addresses yet.</p>
              ) : (
                addresses!.map((addr) => (
                  <div key={addr._id} className="flex items-start justify-between rounded-xl border border-ink/8 p-4">
                    <div className="text-sm">
                      <p className="font-semibold text-ink">{addr.fullName}</p>
                      <p className="text-ink/60">{addr.phone}</p>
                      <p className="text-ink/60">
                        {addr.street}, {addr.city}, {addr.district} {addr.postalCode}
                      </p>
                    </div>
                    <button
                      onClick={() => addr._id && deleteAddress.mutate(addr._id)}
                      className="text-ink/40 hover:text-clay-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <Link to="/orders" className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4 hover:shadow-soft">
            <LayoutDashboard className="h-5 w-5 text-forest-500" />
            <span className="font-medium text-ink">My orders</span>
          </Link>
          {user?.role === 'customer' && (
            <Link to="/sell" className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4 hover:shadow-soft">
              <Store className="h-5 w-5 text-clay-500" />
              <span className="font-medium text-ink">Become a seller</span>
            </Link>
          )}
          {(user?.role === 'seller' || user?.role === 'admin') && (
            <Link to="/seller" className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4 hover:shadow-soft">
              <Store className="h-5 w-5 text-clay-500" />
              <span className="font-medium text-ink">Seller dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

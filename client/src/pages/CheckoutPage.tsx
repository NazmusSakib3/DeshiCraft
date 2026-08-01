import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { formatBDT } from '../lib/format';
import type { Address, Order, PaymentMethod } from '../types';
import { DistrictSelect } from '../components/DistrictSelect';

const SHIPPING_FEE = 60;

const emptyAddress: Address = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  district: '',
  postalCode: '',
};

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCartStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);

  const { data: savedAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get<{ addresses: Address[] }>('/users/addresses');
      return data.addresses;
    },
  });

  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      setAddress(savedAddresses[0]);
    }
  }, [savedAddresses]);

  useEffect(() => {
    if (lines.length === 0) navigate('/cart');
  }, [lines.length, navigate]);

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [key]: e.target.value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await api.post<{ order: Order }>('/orders', {
        items: lines.map((l) => ({ product: l.productId, quantity: l.quantity })),
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          district: address.district,
          postalCode: address.postalCode || undefined,
        },
        paymentMethod: payment,
      });

      if (payment === 'stripe') {
        const { data: checkout } = await api.post<{ url: string }>('/payments/stripe/checkout', {
          orderId: data.order._id,
        });
        clear();
        window.location.href = checkout.url;
        return;
      }

      if (payment === 'sslcommerz') {
        const { data: gateway } = await api.post<{ url: string }>('/payments/sslcommerz/init', {
          orderId: data.order._id,
        });
        clear();
        window.location.href = gateway.url;
        return;
      }

      clear();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setPlacing(false);
    }
  };

  const sub = subtotal();
  const isOnlinePayment = payment === 'stripe' || payment === 'sslcommerz';

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-4xl font-bold text-ink">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Full name</label>
                <input value={address.fullName} onChange={set('fullName')} required className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={address.phone} onChange={set('phone')} required className="input" placeholder="+8801..." />
              </div>
              <div>
                <label className="label">District</label>
                <DistrictSelect
                  value={address.district}
                  onChange={(district) => setAddress((a) => ({ ...a, district }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Street address</label>
                <input value={address.street} onChange={set('street')} required className="input" />
              </div>
              <div>
                <label className="label">City / Area</label>
                <input value={address.city} onChange={set('city')} required className="input" />
              </div>
              <div>
                <label className="label">Postal code (optional)</label>
                <input value={address.postalCode ?? ''} onChange={set('postalCode')} className="input" />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Payment method</h2>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setPayment('cod')}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition',
                  payment === 'cod' ? 'border-forest-500 bg-forest-50' : 'border-ink/10 hover:border-ink/20',
                )}
              >
                <Banknote className="h-6 w-6 text-forest-500" />
                <div>
                  <p className="font-semibold text-ink">Cash on delivery</p>
                  <p className="text-xs text-ink/50">Pay when your order arrives</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPayment('stripe')}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition',
                  payment === 'stripe' ? 'border-forest-500 bg-forest-50' : 'border-ink/10 hover:border-ink/20',
                )}
              >
                <CreditCard className="h-6 w-6 text-forest-500" />
                <div>
                  <p className="font-semibold text-ink">Card (Stripe)</p>
                  <p className="text-xs text-ink/50">Visa, Mastercard, and international cards</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPayment('sslcommerz')}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition',
                  payment === 'sslcommerz' ? 'border-forest-500 bg-forest-50' : 'border-ink/10 hover:border-ink/20',
                )}
              >
                <Smartphone className="h-6 w-6 text-forest-500" />
                <div>
                  <p className="font-semibold text-ink">SSLCommerz</p>
                  <p className="text-xs text-ink/50">bKash, Nagad, Rocket, and local cards</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit card p-6">
          <h2 className="text-lg font-bold text-ink">Your order</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-2 text-sm">
                <span className="text-ink/70">
                  {l.title} <span className="text-ink/40">x{l.quantity}</span>
                </span>
                <span className="font-medium">{formatBDT(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/8 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="font-medium">{formatBDT(sub)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="font-medium">{formatBDT(SHIPPING_FEE)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/8 pt-2 text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-forest-500">{formatBDT(sub + SHIPPING_FEE)}</dd>
            </div>
          </dl>
          <button disabled={placing} className="btn-primary mt-5 w-full">
            {placing
              ? 'Processing...'
              : isOnlinePayment
                ? 'Continue to payment'
                : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}

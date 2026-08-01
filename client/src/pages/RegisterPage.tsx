import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { apiError } from '../lib/api';

export default function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-3xl font-bold text-ink">Join DeshiCraft</h1>
        <p className="mt-1 text-ink/60">Create an account to shop and save favourites.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input"
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-forest-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

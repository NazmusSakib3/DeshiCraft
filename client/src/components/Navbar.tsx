import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

function NavIconTooltip({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={clsx('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute -bottom-9 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:block"
      >
        {label}
      </span>
    </span>
  );
}

export function Navbar() {  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const count = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setMenuOpen(false);
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : null;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-500 font-display text-lg font-bold text-brass-300">
            D
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Deshi<span className="text-clay-500">Craft</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink to="/shop" className={({ isActive }) => clsx('btn-ghost', isActive && 'text-forest-500')}>
            Shop
          </NavLink>
          <NavLink to="/artisans" className={({ isActive }) => clsx('btn-ghost', isActive && 'text-forest-500')}>
            Artisans
          </NavLink>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search handmade goods..."
              className="input pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {user && (
            <NavIconTooltip label="Wishlist">
              <Link to="/wishlist" className="btn-ghost hidden sm:inline-flex" aria-label="Wishlist" title="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </NavIconTooltip>
          )}
          <NavIconTooltip label="Cart">
            <Link to="/cart" className="btn-ghost relative" aria-label="Cart" title="Cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </NavIconTooltip>

          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              {dashboardPath && (
                <NavIconTooltip label="Dashboard">
                  <Link to={dashboardPath} className="btn-ghost" aria-label="Dashboard" title="Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                </NavIconTooltip>
              )}
              <NavIconTooltip label="Account">
                <Link to="/account" className="btn-ghost" aria-label="Account" title="Account">
                  <UserIcon className="h-5 w-5" />
                </Link>
              </NavIconTooltip>
              <NavIconTooltip label="Log out">
                <button onClick={() => logout()} className="btn-ghost" aria-label="Log out" title="Log out">
                  <LogOut className="h-5 w-5" />
                </button>
              </NavIconTooltip>
            </div>          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Join
              </Link>
            </div>
          )}

          <NavIconTooltip label="Menu">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="btn-ghost md:hidden"
              aria-label="Menu"
              title="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </NavIconTooltip>        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink/8 bg-paper px-4 py-4 md:hidden">
          <form onSubmit={onSearch} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search..."
                className="input pl-9"
              />
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="btn-ghost justify-start">
              Shop
            </Link>
            <Link to="/artisans" onClick={() => setMenuOpen(false)} className="btn-ghost justify-start">
              Artisans
            </Link>
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="btn-ghost justify-start">
                  My account
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="btn-ghost justify-start">
                  My orders
                </Link>
                {dashboardPath && (
                  <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="btn-ghost justify-start">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="btn-ghost justify-start"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary">
                  Join DeshiCraft
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/8 bg-forest-700 text-paper/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <span className="font-display text-2xl font-bold text-white">
            Deshi<span className="text-brass-300">Craft</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            A marketplace connecting Bangladeshi artisans directly with people who value
            handmade craft.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-brass-300">All products</Link></li>
            <li><Link to="/artisans" className="hover:text-brass-300">Meet artisans</Link></li>
            <li><Link to="/wishlist" className="hover:text-brass-300">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Sell</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sell" className="hover:text-brass-300">Become a seller</Link></li>
            <li><Link to="/seller" className="hover:text-brass-300">Seller dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-brass-300">Sign in</Link></li>
            <li><Link to="/orders" className="hover:text-brass-300">My orders</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-paper/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} DeshiCraft.</p>
          <p>Built with MongoDB, Express, React &amp; Node.</p>
        </div>
      </div>
    </footer>
  );
}

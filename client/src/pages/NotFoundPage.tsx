import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="font-display text-7xl font-bold text-forest-500">404</span>
      <h1 className="mt-4 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-ink/60">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}

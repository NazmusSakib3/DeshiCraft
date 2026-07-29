import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';
import { PageLoader } from './Spinner';

export function ProtectedRoute() {
  const { user, status } = useAuthStore();
  const location = useLocation();

  if (status !== 'ready') return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

export function RoleRoute({ roles }: { roles: Role[] }) {
  const { user, status } = useAuthStore();
  if (status !== 'ready') return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

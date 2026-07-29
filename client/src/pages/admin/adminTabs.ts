import { LayoutDashboard, ShoppingCart, Store, Tags, Users } from 'lucide-react';
import type { DashboardTab } from '../../components/DashboardNav';

export const adminTabs: DashboardTab[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/sellers', label: 'Sellers', icon: Store },
  { to: '/admin/users', label: 'Users', icon: Users },
];

import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import type { DashboardTab } from '../../components/DashboardNav';

export const sellerTabs: DashboardTab[] = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/seller/products', label: 'Products', icon: Package },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
];

import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute, RoleRoute } from './components/RouteGuards';
import { PageLoader } from './components/Spinner';
import { useAuthStore } from './store/authStore';
import { useWishlistStore } from './store/wishlistStore';
import { setUnauthorizedHandler } from './lib/api';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import ArtisansPage from './pages/ArtisansPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import SellPage from './pages/SellPage';
import NotFoundPage from './pages/NotFoundPage';

import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerProductForm from './pages/seller/SellerProductForm';
import SellerOrders from './pages/seller/SellerOrders';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

export default function App() {
  const { status, bootstrap, user } = useAuthStore();
  const loadWishlist = useWishlistStore((s) => s.load);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const navigate = useNavigate();

  useEffect(() => {
    void bootstrap();
    setUnauthorizedHandler(() => {
      useAuthStore.getState().setUser(null);
      navigate('/login');
    });
  }, [bootstrap, navigate]);

  useEffect(() => {
    if (user) void loadWishlist();
    else clearWishlist();
  }, [user, loadWishlist, clearWishlist]);

  if (status !== 'ready') return <PageLoader label="Warming up the workshop" />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/artisans" element={<ArtisansPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sell" element={<SellPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>

        <Route element={<RoleRoute roles={['seller', 'admin']} />}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/new" element={<SellerProductForm />} />
          <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
        </Route>

        <Route element={<RoleRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

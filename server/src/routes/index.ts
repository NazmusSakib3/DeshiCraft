import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import orderRoutes from './orderRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'deshicraft-api', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);

export default router;

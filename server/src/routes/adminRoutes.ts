import { Router } from 'express';
import {
  adminStats,
  approveSeller,
  deleteUser,
  listAllOrders,
  listSellers,
  listUsers,
  updateUserBlock,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { blockUserSchema } from '../validation/schemas.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', adminStats);
router.get('/users', listUsers);
router.patch('/users/:id/block', validate(blockUserSchema), updateUserBlock);
router.delete('/users/:id', deleteUser);
router.get('/sellers', listSellers);
router.patch('/sellers/:id/approve', approveSeller);
router.get('/orders', listAllOrders);

export default router;

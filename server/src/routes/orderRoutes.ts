import { Router } from 'express';
import {
  cancelOrder,
  createOrder,
  getOrder,
  myOrders,
  sellerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderSchema, orderStatusSchema } from '../validation/schemas.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(orderSchema), createOrder);
router.get('/mine', myOrders);
router.get('/seller', authorize('seller', 'admin'), sellerOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorize('seller', 'admin'), validate(orderStatusSchema), updateOrderStatus);

export default router;

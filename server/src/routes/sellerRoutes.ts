import { Router } from 'express';
import { applyAsSeller, sellerDashboard } from '../controllers/sellerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sellerApplySchema } from '../validation/schemas.js';

const router = Router();

router.use(authenticate);

router.post('/apply', validate(sellerApplySchema), applyAsSeller);
router.get('/dashboard', authorize('seller', 'admin'), sellerDashboard);

export default router;

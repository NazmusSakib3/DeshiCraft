import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  listMyProducts,
  listProducts,
  updateProduct,
} from '../controllers/productController.js';
import { createReview, listReviews } from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchema, productUpdateSchema, reviewSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', listProducts);
router.get('/mine', authenticate, authorize('seller', 'admin'), listMyProducts);
router.post('/', authenticate, authorize('seller', 'admin'), validate(productSchema), createProduct);

router.get('/:slug', getProductBySlug);
router.get('/:slug/reviews', listReviews);
router.post('/:slug/reviews', authenticate, validate(reviewSchema), createReview);

router.patch('/:id', authenticate, authorize('seller', 'admin'), validate(productUpdateSchema), updateProduct);
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteProduct);

export default router;

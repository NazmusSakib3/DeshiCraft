import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categorySchema } from '../validation/schemas.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, authorize('admin'), validate(categorySchema), createCategory);
router.patch('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;

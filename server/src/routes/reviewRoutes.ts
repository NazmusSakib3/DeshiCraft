import { Router } from 'express';
import { deleteReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.delete('/:id', authenticate, deleteReview);

export default router;

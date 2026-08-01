import { Router } from 'express';
import { uploadProductImage } from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { productImageUpload } from '../middleware/upload.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  productImageUpload.single('image'),
  uploadProductImage,
);

export default router;

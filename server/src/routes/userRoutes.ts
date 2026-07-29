import { Router } from 'express';
import {
  addAddress,
  deleteAddress,
  getWishlist,
  listAddresses,
  toggleWishlist,
  updateProfile,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema, updateProfileSchema } from '../validation/schemas.js';

const router = Router();

router.use(authenticate);

router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.get('/addresses', listAddresses);
router.post('/addresses', validate(addressSchema), addAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

export default router;

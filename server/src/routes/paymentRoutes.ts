import { Router } from 'express';
import {
  createStripeCheckout,
  initiateSslcommerz,
  sslcommerzCancel,
  sslcommerzFail,
  sslcommerzIpn,
  sslcommerzSuccess,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentSessionSchema } from '../validation/schemas.js';

const router = Router();

router.post('/stripe/checkout', authenticate, validate(paymentSessionSchema), createStripeCheckout);
router.post('/sslcommerz/init', authenticate, validate(paymentSessionSchema), initiateSslcommerz);

router.post('/sslcommerz/ipn', sslcommerzIpn);
router.get('/sslcommerz/success', sslcommerzSuccess);
router.get('/sslcommerz/fail', sslcommerzFail);
router.get('/sslcommerz/cancel', sslcommerzCancel);

export default router;

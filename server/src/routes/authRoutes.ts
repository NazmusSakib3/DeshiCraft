import { Router } from 'express';
import { login, logout, me, refresh, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.ts';
import { authenticate, authorize } from '../middleware/auth.middleware.ts';

const router = Router();

/**
 * Register a new user
 * POST /auth/register */
router.post(
  '/register',
  rateLimitMiddleware, // Apply rate limiting
  AuthController.register, // Handler
);

/**
 * Login user
 * POST /auth/login */
router.post(
  '/login',
  rateLimitMiddleware, // Apply rate limiting
  AuthController.login, // Handler
);

/**
 * Get current user profile (requires auth middleware)
 * GET /auth/me
 */
router.get(
  '/me',
  authenticate,
  AuthController.getMe, // Handler
);

export default router;

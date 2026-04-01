import { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.ts';
import { cacheUsersList } from '../middleware/cache.middleware.ts';
import { authenticate, authorize } from '../middleware/auth.middleware.ts';

const router = Router();

// Protect all user routes with authentication
router.use(authenticate);

// Protect all user routes with authorization (admin only)
router.use(authorize(['admin']));

/**
 * Get all users (with optional role filter and caching)
 * GET /users */
router.get(
  '/',
  cacheUsersList, // Apply caching
  UserController.getAllUsers, // Handler
);

/**
 * Get user by ID
 * GET /users/:id
 */
router.get(
  '/:id',
  UserController.getUserById, // Handler
);

/**
 * Create a new user (admin only)
 * POST /users */
router.post(
  '/',
  rateLimitMiddleware, // Apply rate limiting
  UserController.createUser, // Handler
);

/**
 * Update user
 * PUT /users/:id
 */
router.put(
  '/:id',
  rateLimitMiddleware, // Apply rate limiting
  UserController.updateUser, // Handler
);

/**
 * Update user status
 * PATCH /users/:id/status
 */
router.patch(
  '/:id/status',
  rateLimitMiddleware, // Apply rate limiting
  UserController.updateUserStatus, // Handler
);

/**
 * Delete user
 * DELETE /users/:id
 */
router.delete(
  '/:id',
  rateLimitMiddleware, // Apply rate limiting
  UserController.deleteUser, // Handler
);

/**
 * Get available agents
 * GET /users/agents/available
 */
router.get(
  '/agents/available',
  UserController.getAvailableAgents, // Handler
);

export default router;

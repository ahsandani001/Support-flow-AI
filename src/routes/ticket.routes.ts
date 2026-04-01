import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.ts';
import {
  cacheTicketsList,
  cacheTicketById,
} from '../middleware/cache.middleware.ts';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.ts';
import { authenticate, authorize } from '../middleware/auth.middleware.ts';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// Create a new ticket (with rate limiting)
router.post(
  '/',
  authorize(['admin', 'customer']), // Admin OR customer can create tickets
  rateLimitMiddleware,
  TicketController.createTicket,
);

// Get all tickets (with caching)
router.get(
  '/',
  authorize(['admin', 'agent', 'customer']), // Admin OR agent OR customer can view tickets
  cacheTicketsList,
  TicketController.getAllTickets,
);

// Get a ticket by ID (with caching)
router.get(
  '/:id',
  authorize(['admin', 'agent', 'customer']), // Admin OR agent OR customer can view tickets
  cacheTicketById,
  TicketController.getTicketById,
);

// Delete a ticket by ID (with rate limiting)
router.delete(
  '/:id',
  authorize(['admin', 'customer']), // Admin OR customer can delete tickets
  rateLimitMiddleware,
  TicketController.deleteTicket,
);

router.get(
  '/:ticketId/similar',
  authorize(['admin', 'agent', 'customer']), // Admin OR customer can get similar tickets
  TicketController.getSimilarTickets,
);

export default router;

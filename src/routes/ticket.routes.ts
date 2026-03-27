import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.ts';
import {
  cacheTicketsList,
  cacheTicketById,
} from '../middleware/cache.middleware.ts';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware.ts';

const router = Router();

// Create a new ticket (with rate limiting)
router.post('/ticket', rateLimitMiddleware, TicketController.createTicket);

// Get all tickets (with caching)
router.get('/', cacheTicketsList, TicketController.getAllTickets);

// Get a ticket by ID (with caching)
router.get('/tickets/:id', cacheTicketById, TicketController.getTicketById);

// Delete a ticket by ID (with rate limiting)
router.delete(
  '/tickets/:id',
  rateLimitMiddleware,
  TicketController.deleteTicket,
);

router.get('/tickets/:ticketId/similar', TicketController.getSimilarTickets);

export default router;

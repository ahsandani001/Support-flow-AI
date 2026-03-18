import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.ts';
import {
  cacheTicketsList,
  cacheTicketById,
} from '../middleware/cache.middleware.ts';

const router = Router();

// Create a new ticket
router.post('/ticket', TicketController.createTicket);

// Get all tickets (with caching)
router.get('/', cacheTicketsList, TicketController.getAllTickets);

// Get a ticket by ID (with caching)
router.get('/tickets/:id', cacheTicketById, TicketController.getTicketById);

// Delete a ticket by ID
router.delete('/tickets/:id', TicketController.deleteTicket);

export default router;

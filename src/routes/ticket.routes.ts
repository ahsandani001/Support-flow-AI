import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.ts';

const router = Router();

// Create a new ticket
router.post('/ticket', TicketController.createTicket);

// Get all tickets
router.get('/', TicketController.getAllTickets);

// Get a ticket by ID
router.get('/tickets/:id', TicketController.getTicketById);

export default router;

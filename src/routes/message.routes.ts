import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.ts';
import { authenticate, authorize } from '../middleware/auth.middleware.ts';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Add a message to a ticket
router.post(
  '/tickets/:id/messages',
  authorize(['admin', 'agent', 'customer']), // Admin OR agent OR customer can create messages
  MessageController.addMessage,
);

// Get all messages for a ticket
router.get(
  '/tickets/:id/messages',
  authorize(['admin', 'agent', 'customer']), // Admin OR agent OR customer can view messages
  MessageController.getMessages,
);

export default router;

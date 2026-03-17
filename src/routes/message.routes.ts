import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.ts';

const router = Router();

// Add a message to a ticket
router.post('/tickets/:id/messages', MessageController.addMessage);

// Get all messages for a ticket
router.get('/tickets/:id/messages', MessageController.getMessages);

export default router;

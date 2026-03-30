import express from 'express';
import { Message } from '../models/messages.model.ts';

type Request = express.Request;
type Response = express.Response;

export class MessageController {
  /**
   * Add a message to a ticket
   * POST /tickets/:id/messages
   */
  static async addMessage(req: Request, res: Response) {
    try {
      const ticketId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const messageData = {
        ticketId,
        ...req.body,
      };

      const message = await Message.create(messageData);
      res.status(201).json(message);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to add message' });
    }
  }

  /**
   * Get all messages for a ticket
   * GET /tickets/:id/messages
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const ticketId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const messages = await Message.find({ ticketId }).sort({
        createdAt: 1,
      });
      res.json({ Total: messages.length, messages });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  static async deleteMessagesByTicketId(ticketId: string): Promise<void> {
    // Delete all messages associated with the given ticket
    await Message.deleteMany({ ticketId });
  }
}

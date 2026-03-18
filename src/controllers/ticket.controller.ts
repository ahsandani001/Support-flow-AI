import express from 'express';
import { TicketModel } from '../models/ticket.model.ts';
import { invalidateTicketCache } from '../utils/cache.utils.ts';

type Request = express.Request;
type Response = express.Response;

export class TicketController {
  /**
   * Create a new ticket
   * POST /ticket
   */
  static async createTicket(req: Request, res: Response) {
    try {
      const ticket = await TicketModel.insert(req.body);

      // Invalidate cache when a new ticket is created
      await invalidateTicketCache();

      res.status(200).json(ticket);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  /**
   * Get all tickets
   * GET /
   */
  static async getAllTickets(req: Request, res: Response) {
    try {
      const tickets = await TicketModel.findAll();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  }

  /**
   * Get a ticket by ID
   * GET /tickets/:id
   */
  static async getTicketById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.json(ticket);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to fetch ticket' });
    }
  }

  /**
   * Delete a ticket by ID
   * DELETE /tickets/:id
   */
  static async deleteTicket(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const ticket = await TicketModel.delete(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Invalidate cache when a ticket is deleted
      await invalidateTicketCache();

      res.json({ message: 'Ticket deleted successfully', ticket });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }
}

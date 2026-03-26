import express from 'express';
import { TicketModel } from '../models/ticket.model.ts';
import { invalidateTicketCache } from '../utils/cache.utils.ts';
import {
  generateEmbeddings,
  storeEmbeddings,
} from '../utils/ticketEmbeddingUtil.ts';
import { query } from '../config/postgres.ts';

type Request = express.Request;
type Response = express.Response;

export class TicketController {
  /**
   * Create a new ticket
   * POST /ticket
   */
  static async createTicket(req: Request, res: Response) {
    try {
      await query('BEGIN');

      const ticket = await TicketModel.insert(req.body);

      // Create embeddings for every ticket and store
      const ticketText = `${ticket.title} ${ticket.description}`;
      const embeddings = await generateEmbeddings(ticketText);

      // store embeddings
      await storeEmbeddings(ticket.id, embeddings);

      // Invalidate cache when a new ticket is created
      await invalidateTicketCache();
      await query('COMMIT');

      res.status(200).json(ticket);
    } catch (err: any) {
      // Rollback everything
      await query('ROLLBACK');
      console.error('Transaction failed:', err, typeof err);
      if (err.code === '23505') {
        // PostgreSQL unique violation
        res.status(409).json({ error: 'Ticket already exists' });
      } else if (err.message?.includes('OpenAI')) {
        res.status(502).json({ error: 'AI service unavailable' });
      } else {
        res.status(500).json({ error: 'Failed to create ticket' });
      }
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

import express from 'express';
import { TicketModel } from '../models/ticket.model.ts';
import { invalidateTicketCache } from '../utils/cache.utils.ts';
import {
  generateEmbeddings,
  storeEmbeddings,
  deleteEmbeddings,
} from '../utils/ticketEmbeddingUtil.ts';
import { MessageController } from './message.controller.ts';
import { query } from '../config/postgres.ts';
import { generateTags } from '../utils/aiTag.util.ts';

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

      // Generate tags
      const tags = await generateTags(req.body.title, req.body.description);

      // Get customer ID from authenticated user
      const customerId = (req as any).user?.id;

      const ticket = await TicketModel.insert(
        {
          ...req.body,
          customer_id: customerId,
        },
        tags,
      );

      // Create embeddings for every ticket and store
      const ticketText =
        `${ticket.title}\n\n${ticket.description || ''}`.trim();
      const embeddings = await generateEmbeddings(ticketText);

      // store embeddings
      await storeEmbeddings(ticket.id, embeddings);

      // Invalidate cache when a new ticket is created
      await invalidateTicketCache();
      await query('COMMIT');

      res.status(200).json({ ...ticket, aiSuggestedTags: tags });
    } catch (err: any) {
      // Rollback everything
      await query('ROLLBACK');
      console.error('Transaction failed:', err);
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
      await query('BEGIN');

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const ticket = await TicketModel.delete(id);
      if (!ticket) {
        await query('ROLLBACK');
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Delete associated embeddings
      await deleteEmbeddings(id);

      // Delete associated messages
      await MessageController.deleteMessagesByTicketId(id);

      // Invalidate cache when a ticket is deleted
      await invalidateTicketCache();

      await query('COMMIT');

      res.json({ message: 'Ticket deleted successfully', ticket });
    } catch (err) {
      await query('ROLLBACK');
      console.log('Transaction failed: ', err);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }

  /**
   * Get similar tickets from a given ticket
   * GET /tickets/:ticketId/similar
   */
  static getSimilarTickets = async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { limit = 5, minSimilarity = 0.7 } = req.query;

      // 1. Get embedding for this ticket
      const embeddingResult = await query(
        'SELECT embedding, (SELECT title FROM tickets WHERE id = $1) FROM ticket_embeddings WHERE ticket_id = $1',
        [ticketId],
      );

      if (embeddingResult.rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'No embedding found for this ticket' });
      }

      const embedding = embeddingResult.rows[0].embedding;
      const currentTicketTitle = embeddingResult.rows[0].title;

      const similar = await query(
        `
      SELECT 
        t.id, t.title, t.description, t.status, t.created_at,
        1 - (te.embedding <=> $1::vector) as similarity
      FROM ticket_embeddings te
      JOIN tickets t ON t.id = te.ticket_id
      WHERE te.ticket_id != $2
      AND 1 - (te.embedding <=> $1::vector) >= $3
      ORDER BY te.embedding <=> $1::vector
      LIMIT $4
    `,
        [embedding, ticketId, minSimilarity, limit],
      );

      res.json({
        message: `Found ${similar.rows.length} similar tickets (min similarity: ${minSimilarity})`,
        current_ticket: {
          id: ticketId,
          title: currentTicketTitle,
        },
        similar_tickets: similar.rows.map((ticket) => ({
          ...ticket,
          similarity_percentage: `${(ticket.similarity * 100).toFixed(1)}%`,
        })),
      });
    } catch (error) {
      console.error('Error finding similar tickets:', error);
      res.status(500).json({ error: 'Failed to find similar tickets' });
    }
  };
}

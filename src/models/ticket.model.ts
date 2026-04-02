import { query } from '../config/postgres.ts';

export interface Ticket {
  id?: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  customer_email: string;
  customer_id?: string; // New field
  assigned_to?: string; // New field
  resolved_by?: string; // New field
  created_at?: Date;
}

export class TicketModel {
  static async insert(ticket: Ticket, autoTags?: string[]) {
    const sql = `
            INSERT INTO tickets (title, description, customer_email, tags, customer_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
    const values = [
      ticket.title,
      ticket.description,
      ticket.customer_email,
      autoTags || [],
      ticket.customer_id,
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get all tickets
  static async findAll() {
    const result = await query(
      `SELECT * FROM tickets ORDER BY created_at DESC`,
    );
    return { total: result.rowCount, rows: result.rows };
  }

  // Get one ticket
  static async findById(id: string) {
    const result = await query(`SELECT * FROM tickets where id = $1`, [id]);
    return result.rows[0];
  }

  // Delete a ticket
  static async delete(id: string) {
    const result = await query(
      `DELETE FROM tickets WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  }
}

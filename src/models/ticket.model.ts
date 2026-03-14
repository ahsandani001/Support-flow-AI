import { query } from '../config/postgres.ts';

export interface Ticket {
  id?: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  customer_email: string;
  created_at?: Date;
}

export class TicketModel {
  static async createTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS tickets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'open',
                customer_email VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;
    await query(sql);
    console.log('✅ Tickets table ready');
  }

  // Insert a new Ticket
  static async insert(ticket: Ticket) {
    const sql = `
            INSERT INTO tickets (title, description, customer_email)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
    const values = [ticket.title, ticket.description, ticket.customer_email];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get all tickets
  static async findAll() {
    const result = await query(
      `SELECT * FROM tickets ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  // Get one ticket
  static async findById(id: string) {
    const result = await query(`SELECT * FROM tickets where id = $1`, [id]);
    return result.rows[0];
  }
}

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

  static async createEmbeddingTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ticket_embeddings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
          embedding vector(384),  -- 384 dimensions for nomic-embed-text
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(ticket_id)
      )`;
    await query(sql);
    console.log('✅ Tickets Embedding table ready');
  }

  static async createIndexEmbedding() {
    const sql = `
          CREATE INDEX IF NOT EXISTS idx_ticket_embeddings ON ticket_embeddings 
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100)
    `;
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

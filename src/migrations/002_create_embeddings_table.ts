import { query } from '../config/postgres.ts';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS ticket_embeddings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
          embedding vector(384),  -- 384 dimensions for nomic-embed-text
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(ticket_id)
      )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_ticket_embeddings ON ticket_embeddings 
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
  `);
}

export async function down() {
  await query(`DROP INDEX IF EXISTS idx_ticket_embeddings`);
  await query(`DROP TABLE IF EXISTS ticket_embeddings`);
}

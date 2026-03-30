import { query } from '../config/postgres.ts';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS tickets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'open',
                customer_email VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
  `);
}

export async function down() {
  await query(`DROP INDEX IF EXISTS idx_tickets_customer_email`);
  await query(`DROP TABLE IF EXISTS tickets`);
  console.log('✅ Rolled back tickets table');
}

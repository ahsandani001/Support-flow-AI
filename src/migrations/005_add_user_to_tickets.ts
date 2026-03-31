import { query } from '../config/postgres.ts';

export async function up() {
  await query(`
    ALTER TABLE tickets 
    ADD COLUMN customer_id UUID REFERENCES users(id),
    ADD COLUMN assigned_to UUID REFERENCES users(id),
    ADD COLUMN resolved_by UUID REFERENCES users(id);
    
    CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
    CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
    CREATE INDEX idx_tickets_resolved_id ON tickets(resolved_by);
  `);
}

export async function down() {
  await query(`
    ALTER TABLE tickets 
    DROP COLUMN customer_id,
    DROP COLUMN assigned_to,
    DROP COLUMN resolved_by;

    DROP INDEX IF EXISTS idx_tickets_assigned_to;
    DROP INDEX IF EXISTS idx_tickets_customer_id;
    DROP INDEX IF EXISTS idx_tickets_resolved_id;
  `);
}

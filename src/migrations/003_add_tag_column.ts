import { query } from '../config/postgres.ts';

export async function up() {
  await query(`
    ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_tickets_tags ON tickets USING GIN (tags);
  `);
}

export async function down() {
  await query(`DROP INDEX IF EXISTS idx_tickets_tags`);
  await query(`ALTER TABLE tickets DROP COLUMN tags`);
  console.log('✅ Rolled back tags column');
}

import { query } from '../config/postgres.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MigrationRunner {
  private static async ensureMigrationTable() {
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Migration tracking table ready');
  }

  private static async getAppliedMigrations(): Promise<Set<string>> {
    const result = await query(
      `SELECT name FROM schema_migrations ORDER BY id`,
    );
    return new Set(result.rows.map((row) => row.name));
  }

  private static async markAsApplied(name: string) {
    await query(`INSERT INTO schema_migrations (name) VALUES ($1)`, [name]);
  }

  static async runMigrations() {
    await this.ensureMigrationTable();

    const applied = await this.getAppliedMigrations();

    // Read all file from migration directory
    const files = await fs.readdir(__dirname);

    // Filter for migration files (exclude runner.ts and non-ts files)
    const migrationFiles = files
      .filter((file) => file.match(/^\d+_.*\.ts$/) && file !== 'runner.ts')
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const migrationName = file.replace('.ts', ''); // Remove .ts extension

      if (!applied.has(migrationName)) {
        console.log(`📦 Running migration: ${migrationName}`);

        try {
          const migration = await import(`./${file}`);
          await migration.up();
          await this.markAsApplied(migrationName);
          console.log(`✅ Completed: ${migrationName}`);
        } catch (error) {
          console.error(`❌ Failed: ${migrationName}`, error);
          throw error;
        }
      } else {
        console.log(`⏭️  Skipping already applied: ${migrationName}`);
      }
    }

    console.log('🎉 All migrations completed');
  }
}

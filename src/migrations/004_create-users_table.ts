import { query } from '../config/postgres.ts';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS users(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'customer')),
        skills TEXT[] DEFAULT '{}',
        current_load INT DEFAULT 0,
        max_load INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy')),
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
    );

    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role ON users(role);
  `);

  // Insert default agents for testing
  await query(`
    INSERT INTO users (email, password_hash, name, role, skills) 
    VALUES 
      ('admin@supportflow.com', '$2a$10$...', 'Admin User', 'admin', ARRAY['all']),
      ('agent1@supportflow.com', '$2a$10$...', 'Support Agent 1', 'agent', ARRAY['technical', 'database']),
      ('agent2@supportflow.com', '$2a$10$...', 'Support Agent 2', 'agent', ARRAY['billing', 'account'])
    ON CONFLICT (email) DO NOTHING;
  `);
}

export async function down() {
  await query(`DROP INDEX IF EXISTS idx_users_email`);
  await query(`DROP INDEX IF EXISTS idx_users_role`);
  await query(`DROP TABLE IF EXISTS users CASCADE`);
  console.log('✅ Rolled back tags column');
}

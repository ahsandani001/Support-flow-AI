import { Pool } from 'pg';
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'supportflow',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: Number(process.env.POSTGRES_PORT) || 5432,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// test connection
export const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()');
    console.log('✅ PostgreSQL connected:', res.rows[0]);
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);
  }
};

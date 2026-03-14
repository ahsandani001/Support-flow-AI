import { Pool } from 'pg';
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'supportflow',
  password: 'password',
  port: 5432,
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

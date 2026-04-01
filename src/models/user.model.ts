import { query } from '../config/postgres.ts';

export interface User {
  id?: string;
  email: string;
  password_hash: string;
  name?: string;
  role: 'admin' | 'agent' | 'customer';
  skills?: string[];
  current_load?: number;
  max_load?: number;
  status?: 'active' | 'inactive' | 'busy';
  created_at?: Date;
  last_login?: Date;
}

export class UserModel {
  // Create a new user
  static async create(user: Omit<User, 'id' | 'created_at' | 'last_login'>) {
    const sql = `
      INSERT INTO users (email, password_hash, name, role, skills, current_load, max_load, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, name, role, skills, current_load, max_load, status, created_at, last_login
    `;
    const values = [
      user.email,
      user.password_hash,
      user.name || null,
      user.role,
      user.skills || [],
      user.current_load || 0,
      user.max_load || 0,
      user.status || 'active',
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get all users
  static async findAll() {
    const result = await query(
      `SELECT id, email, name, role, skills, current_load, max_load, status, created_at, last_login 
       FROM users ORDER BY created_at DESC`,
    );
    return { total: result.rowCount, rows: result.rows };
  }

  // Get user by ID
  static async findById(id: string) {
    const result = await query(
      `SELECT id, email, name, role, skills, current_load, max_load, status, created_at, last_login 
       FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  // Get user by email (includes password_hash for authentication)
  static async findByEmail(email: string) {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
  }

  // Update user
  static async update(id: string, updates: Partial<User>) {
    const fields = Object.keys(updates).filter((key) => key !== 'id');
    if (fields.length === 0) return null;

    const setClause = fields
      .map((field, i) => `${field} = $${i + 2}`)
      .join(', ');
    const values = [id, ...Object.values(updates)];

    const result = await query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, email, name, role, skills, current_load, max_load, status`,
      values,
    );
    return result.rows[0];
  }

  // Update user status
  static async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'busy',
  ) {
    const result = await query(
      `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, name, role, status`,
      [status, id],
    );
    return result.rows[0];
  }

  // Update last login
  static async updateLastLogin(id: string) {
    const result = await query(
      `UPDATE users SET last_login = NOW() WHERE id = $1 RETURNING id, email, name`,
      [id],
    );
    return result.rows[0];
  }

  // Delete user
  static async delete(id: string) {
    const result = await query(
      `DELETE FROM users WHERE id = $1 RETURNING id, email, name`,
      [id],
    );
    return result.rows[0];
  }

  // Find users by role
  static async findByRole(role: 'admin' | 'agent' | 'customer') {
    const result = await query(
      `SELECT id, email, name, role, skills, current_load, max_load, status 
       FROM users WHERE role = $1 ORDER BY current_load ASC`,
      [role],
    );
    return { total: result.rowCount, rows: result.rows };
  }

  // Find available agents (active status, not busy)
  static async findAvailableAgents() {
    const result = await query(
      `SELECT id, email, name, skills, current_load, max_load 
       FROM users 
       WHERE role = 'agent' AND status = 'active' 
       ORDER BY current_load ASC`,
    );
    return result.rows;
  }
}

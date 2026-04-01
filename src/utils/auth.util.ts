import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/postgres.ts';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'supportflow-jwtsecret-550e8400-e29b-41d4-a716-446655440000';
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'customer';
  skills?: string[];
  current_load?: number;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' },
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Create user
export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role: User['role'];
  skills?: string[];
}): Promise<User> {
  const password_hash = await hashPassword(userData.password);

  const result = await query(
    `INSERT INTO users (email, password_hash, name, role, skills)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, skills, current_load`,
    [
      userData.email,
      password_hash,
      userData.name,
      userData.role,
      userData.skills || [],
    ],
  );

  return result.rows[0];
}

// Login
export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  const result = await query(
    "SELECT * FROM users WHERE email = $1 AND status = 'active'",
    [email],
  );

  const user = result.rows[0];
  if (!user) return null;

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;

  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    skills: user.skills,
    current_load: user.current_load,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      skills: user.skills,
      current_load: user.current_load,
    },
    token,
  };
}

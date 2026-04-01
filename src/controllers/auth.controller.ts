import express from 'express';
import { UserModel } from '../models/user.model.ts';
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from '../utils/auth.util.ts';

type Request = express.Request;
type Response = express.Response;

export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role, skills } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res
          .status(409)
          .json({ error: 'User with this email already exists' });
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Create user
      const user = await UserModel.create({
        email,
        password_hash,
        name: name || null,
        role: role || 'agent',
        skills: skills || [],
        current_load: 0,
        max_load: 0,
        status: 'active',
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        skills: user.skills,
        current_load: user.current_load,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'User already exists' });
      }
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      // Find user by email (includes password_hash)
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found!' });
      }

      // Verify password
      const validPassword = await verifyPassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'User is inactive' });
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        skills: user.skills,
        current_load: user.current_load,
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          skills: user.skills,
          current_load: user.current_load,
        },
        token,
      });
    } catch (err) {
      console.error('Login failed:', err);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  /**
   * Get current user profile from token
   * GET /auth/me
   */
  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (err) {
      console.error('Get profile failed:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
}

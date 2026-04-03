import express from 'express';
import { UserModel } from '../models/user.model.ts';
import { hashPassword } from '../utils/auth.util.ts';
import { invalidateUserCache } from '../utils/cache.utils.ts';

type Request = express.Request;
type Response = express.Response;

export class UserController {
  /**
   * Get all users
   * GET /users
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { role } = req.query;

      let users;
      if (role) {
        users = await UserModel.findByRole(
          role as 'admin' | 'agent' | 'customer',
        );
      } else {
        users = await UserModel.findAll();
      }

      res.json(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  /**
   * Create a new user (admin only)
   * POST /users
   */
  static async createUser(req: Request, res: Response) {
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
        max_load: 5, // Create a new migration to set agent's default value to 5
        status: 'active',
      });

      // Invalidate cache when a new user is created
      await invalidateUserCache();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err: any) {
      console.error('Failed to create user:', err);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'User already exists' });
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  /**
   * Update user
   * PUT /users/:id
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const { email, password, name, role, skills, status } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Build updates object
      const updates: any = {};
      if (email) updates.email = email;
      if (name) updates.name = name;
      if (role) updates.role = role;
      if (skills) updates.skills = skills;
      if (status) updates.status = status;

      // Hash password if provided
      if (password) {
        updates.password_hash = await hashPassword(password);
      }

      // Update user
      const user = await UserModel.update(id, updates);

      // Invalidate cache when user is updated
      await invalidateUserCache();

      res.json({
        message: 'User updated successfully',
        user,
      });
    } catch (err) {
      console.error('Failed to update user:', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  /**
   * Update user status
   * PATCH /users/:id/status
   */
  static async updateUserStatus(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const { status } = req.body;

      if (!status || !['active', 'inactive', 'busy'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }

      const user = await UserModel.updateStatus(id, status);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user is updated
      await invalidateUserCache();

      res.json({
        message: 'User status updated successfully',
        user,
      });
    } catch (err) {
      console.error('Failed to update user status:', err);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  /**
   * Delete user
   * DELETE /users/:id
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const user = await UserModel.delete(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user is updated
      await invalidateUserCache();

      res.json({
        message: 'User deleted successfully',
        user,
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  /**
   * Get available agents
   * GET /users/agents/available
   */
  static async getAvailableAgents(req: Request, res: Response) {
    try {
      const agents = await UserModel.findAvailableAgents();
      res.json({ agents });
    } catch (err) {
      console.error('Failed to fetch available agents:', err);
      res.status(500).json({ error: 'Failed to fetch available agents' });
    }
  }
}

import express from 'express';
import { redisClient } from '../config/redis.ts';

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // Maximum requests per window
  MESSAGE: 'Too many requests, please try again later.',
};

/**
 * Rate limiting middleware using Redis
 * Limits requests per IP address
 */
export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get client IP address
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${ip}`;

    // Get current request count for this IP
    const current = await redisClient.get(key);
    const requestCount = current ? parseInt(current, 10) : 0;

    // Check if rate limit exceeded
    if (requestCount >= RATE_LIMIT.MAX_REQUESTS) {
      return res.status(429).json({
        error: RATE_LIMIT.MESSAGE,
        retryAfter: Math.ceil(RATE_LIMIT.WINDOW_MS / 1000),
      });
    }

    // Increment request count
    if (requestCount === 0) {
      // First request from this IP, set with expiration
      await redisClient.setEx(key, Math.ceil(RATE_LIMIT.WINDOW_MS / 1000), '1');
    } else {
      // Increment existing count
      await redisClient.incr(key);
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': Math.max(
        0,
        RATE_LIMIT.MAX_REQUESTS - requestCount - 1,
      ).toString(),
      'X-RateLimit-Reset': new Date(
        Date.now() + RATE_LIMIT.WINDOW_MS,
      ).toISOString(),
    });

    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // If Redis fails, allow the request to proceed
    next();
  }
};

/**
 * Stricter rate limiting for sensitive endpoints
 * (e.g., login, registration)
 */
export const strictRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit_strict:${ip}`;

    const current = await redisClient.get(key);
    const requestCount = current ? parseInt(current, 10) : 0;

    // Stricter limits: 10 requests per 15 minutes
    const STRICT_LIMIT = 10;

    if (requestCount >= STRICT_LIMIT) {
      return res.status(429).json({
        error: 'Too many attempts, please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT.WINDOW_MS / 1000),
      });
    }

    if (requestCount === 0) {
      await redisClient.setEx(key, Math.ceil(RATE_LIMIT.WINDOW_MS / 1000), '1');
    } else {
      await redisClient.incr(key);
    }

    res.set({
      'X-RateLimit-Limit': STRICT_LIMIT.toString(),
      'X-RateLimit-Remaining': Math.max(
        0,
        STRICT_LIMIT - requestCount - 1,
      ).toString(),
      'X-RateLimit-Reset': new Date(
        Date.now() + RATE_LIMIT.WINDOW_MS,
      ).toISOString(),
    });

    next();
  } catch (error) {
    console.error('Strict rate limit middleware error:', error);
    next();
  }
};

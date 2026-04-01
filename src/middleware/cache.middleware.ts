import express from 'express';

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

import {
  getFromCache,
  setInCache,
  CACHE_TTL,
  CACHE_KEYS,
} from '../utils/cache.utils.ts';

/**
 * Cache middleware for GET requests
 * @param keyGenerator - Function to generate cache key from request
 * @param ttl - Time to live in seconds
 */
export const cacheMiddleware = (
  keyGenerator: (req: Request) => string,
  ttl: number = CACHE_TTL.TICKETS,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      const cachedData = await getFromCache(cacheKey);

      if (cachedData) {
        // Return cached data
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache the response
      res.json = function (data: any) {
        // Cache the response data
        setInCache(cacheKey, data, ttl).catch((err) => {
          console.error('Failed to cache response:', err);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache middleware for tickets list
 */
export const cacheTicketsList = cacheMiddleware(
  () => CACHE_KEYS.TICKETS,
  CACHE_TTL.TICKETS,
);

/**
 * Cache middleware for individual ticket
 */
export const cacheTicketById = cacheMiddleware((req: Request) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return CACHE_KEYS.TICKET_BY_ID(id);
}, CACHE_TTL.TICKET_BY_ID);

/**
 * Cache middleware for ticket messages
 */
export const cacheTicketMessages = cacheMiddleware((req: Request) => {
  const ticketId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  return CACHE_KEYS.TICKET_MESSAGES(ticketId);
}, CACHE_TTL.MESSAGES);

/**
 * Cache middleware for users list
 */
export const cacheUsersList = cacheMiddleware(
  () => CACHE_KEYS.USERS,
  CACHE_TTL.USERS || CACHE_TTL.TICKETS,
);

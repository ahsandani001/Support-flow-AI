import { redisClient } from '../config/redis.ts';

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  TICKETS: 300, // 5 minutes for tickets list
  TICKET_BY_ID: 300, // 5 minutes for individual ticket
  MESSAGES: 180, // 3 minutes for messages
  USERS: 300, // 5 minutes for users list
};

// Cache key generators
export const CACHE_KEYS = {
  TICKETS: 'tickets:all',
  USERS: 'users:all',
  TICKET_BY_ID: (id: string) => `tickets:${id}`,
  TICKET_MESSAGES: (ticketId: string) => `tickets:${ticketId}:messages`,
};

/**
 * Get data from cache
 * @param key - Cache key
 * @returns Cached data or null if not found
 */
export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set data in cache
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in seconds
 */
export const setInCache = async <T>(
  key: string,
  data: T,
  ttl: number,
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

/**
 * Delete data from cache
 * @param key - Cache key or pattern
 */
export const deleteFromCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param pattern - Pattern to match (e.g., 'tickets:*')
 */
export const deletePatternFromCache = async (
  pattern: string,
): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
};

/**
 * Invalidate all ticket-related cache
 */
export const invalidateTicketCache = async (): Promise<void> => {
  try {
    await deletePatternFromCache('tickets:*');
  } catch (error) {
    console.error('Ticket cache invalidation error:', error);
  }
};

/**
 * Invalidate all user-related cache
 */
export const invalidateUserCache = async (): Promise<void> => {
  try {
    await deletePatternFromCache('users:*');
  } catch (error) {
    console.error('User cache invalidation error:', error);
  }
};

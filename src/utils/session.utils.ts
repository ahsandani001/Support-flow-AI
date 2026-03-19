import { redisClient } from '../config/redis.ts';

const SESSION_PREFIX = 'session:';
const SESSION_TTL = 60 * 60 * 24; // 24 hours

/**
 * Generates a session key.
 * @param sessionId - The unique session ID.
 * @returns The session key string.
 */
export const getSessionKey = (sessionId: string): string => {
  return `${SESSION_PREFIX}${sessionId}`;
};

/**
 * Sets session data in Redis.
 * @param sessionId - The unique session ID.
 * @param sessionData - The data to store in the session.
 * @param ttl - The time-to-live for the session in seconds. Defaults to 24 hours.
 * @returns Promise<void>
 */
export const setSessionData = async (
  sessionId: string,
  sessionData: Record<string, any>,
  ttl: number = SESSION_TTL,
): Promise<void> => {
  try {
    const key = getSessionKey(sessionId);
    await redisClient.setEx(key, ttl, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error setting session data:', error);
    throw error; // Re-throw to allow higher-level error handling
  }
};

/**
 * Gets session data from Redis.
 * @param sessionId - The unique session ID.
 * @returns The session data or null if not found or an error occurs.
 */
export const getSessionData = async (
  sessionId: string,
): Promise<Record<string, any> | null> => {
  try {
    const key = getSessionKey(sessionId);
    const sessionData = await redisClient.get(key);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
};

/**
 * Deletes session data from Redis.
 * @param sessionId - The unique session ID.
 * @returns Promise<void>
 */
export const deleteSessionData = async (sessionId: string): Promise<void> => {
  try {
    const key = getSessionKey(sessionId);
    await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting session data:', error);
    throw error;
  }
};

/**
 * Clears all sessions for a given user ID.
 * This is useful for logging out a user from all devices.
 * @param userId - The ID of the user whose sessions to clear.
 * @returns Promise<void>
 */
export const clearUserSessions = async (userId: string): Promise<void> => {
  try {
    const pattern = `${SESSION_PREFIX}${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error clearing user sessions:', error);
    throw error;
  }
};

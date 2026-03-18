import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL,
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.log('❌ Redis connection error:', error);
    process.exit(1);
  }
};

// Handle Redis errors
redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);
});

// Handle Redis connection
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

// Handle Redis ready
redisClient.on('ready', () => {
  console.log('Redis client ready');
});

// Handle Redis end
redisClient.on('end', () => {
  console.log('Redis client disconnected');
});

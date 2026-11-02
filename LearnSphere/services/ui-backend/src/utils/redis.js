import { createClient } from 'redis';
import { logger } from './logger.js';

export const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redis.on('error', (err) => logger.error({ err }, 'Redis client error'));

export async function connectRedis() {
  await redis.connect().catch((err) =>
    logger.warn({ err }, 'Redis not available — running without cache')
  );
}

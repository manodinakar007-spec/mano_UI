import { Router } from 'express';
import { redis } from '../utils/redis.js';
import { clients } from '../utils/serviceClient.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const checks = await Promise.allSettled([
    redis.ping().then(() => 'ok').catch(() => 'unavailable'),
    clients.courseCatalog.get('/health').then(() => 'ok').catch(() => 'unavailable'),
    clients.enrollment.get('/health').then(() => 'ok').catch(() => 'unavailable'),
  ]);

  const [redisStatus, catalogStatus, enrollmentStatus] = checks.map((r) =>
    r.status === 'fulfilled' ? r.value : 'unavailable'
  );

  const overall = [redisStatus, catalogStatus, enrollmentStatus].every((s) => s === 'ok') ? 'ok' : 'degraded';

  res.status(overall === 'ok' ? 200 : 207).json({
    status: overall,
    service: 'ui-backend',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: redisStatus,
      courseCatalog: catalogStatus,
      enrollment: enrollmentStatus,
    },
  });
});

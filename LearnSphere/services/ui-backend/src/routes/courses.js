import { Router } from 'express';
import { clients } from '../utils/serviceClient.js';
import { redis } from '../utils/redis.js';

export const coursesRouter = Router();

const CACHE_TTL = 300; // 5 minutes

async function cached(key, fetchFn) {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit);
  } catch { /* cache miss is fine */ }

  const data = await fetchFn();
  try {
    await redis.setEx(key, CACHE_TTL, JSON.stringify(data));
  } catch { /* non-fatal */ }
  return data;
}

// GET /api/courses — list with filters
coursesRouter.get('/', async (req, res, next) => {
  try {
    const { data } = await clients.courseCatalog.get('/api/v1/courses', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/featured
coursesRouter.get('/featured', async (_req, res, next) => {
  try {
    const data = await cached('courses:featured', () =>
      clients.courseCatalog.get('/api/v1/courses/featured').then((r) => r.data)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/categories
coursesRouter.get('/categories', async (_req, res, next) => {
  try {
    const data = await cached('courses:categories', () =>
      clients.courseCatalog.get('/api/v1/categories').then((r) => r.data)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/search?q=
coursesRouter.get('/search', async (req, res, next) => {
  try {
    const { data } = await clients.courseCatalog.get('/api/v1/courses/search', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:id
coursesRouter.get('/:id', async (req, res, next) => {
  try {
    const data = await cached(`course:${req.params.id}`, () =>
      clients.courseCatalog.get(`/api/v1/courses/${req.params.id}`).then((r) => r.data)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

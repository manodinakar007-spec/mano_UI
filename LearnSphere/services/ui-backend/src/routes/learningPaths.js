import { Router } from 'express';
import { clients } from '../utils/serviceClient.js';

export const learningPathsRouter = Router();

learningPathsRouter.get('/', async (req, res, next) => {
  try {
    const { data } = await clients.learningPath.get('/api/v1/paths', { params: req.query });
    res.json(data);
  } catch (err) { next(err); }
});

learningPathsRouter.get('/:id', async (req, res, next) => {
  try {
    const { data } = await clients.learningPath.get(`/api/v1/paths/${req.params.id}`);
    res.json(data);
  } catch (err) { next(err); }
});

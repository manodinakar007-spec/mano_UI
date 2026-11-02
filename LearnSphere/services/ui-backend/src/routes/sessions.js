import { Router } from 'express';
import { clients } from '../utils/serviceClient.js';

export const sessionsRouter = Router();

sessionsRouter.get('/', async (req, res, next) => {
  try {
    const { data } = await clients.liveSession.get('/api/v1/sessions', { params: req.query });
    res.json(data);
  } catch (err) { next(err); }
});

sessionsRouter.get('/:id', async (req, res, next) => {
  try {
    const { data } = await clients.liveSession.get(`/api/v1/sessions/${req.params.id}`);
    res.json(data);
  } catch (err) { next(err); }
});

sessionsRouter.post('/:id/book', async (req, res, next) => {
  try {
    const { data } = await clients.liveSession.post(`/api/v1/sessions/${req.params.id}/book`, {
      ...req.body,
      userId: req.user?.sub,
    });
    res.status(201).json(data);
  } catch (err) { next(err); }
});

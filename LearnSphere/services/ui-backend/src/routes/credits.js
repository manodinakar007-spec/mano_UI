import { Router } from 'express';
import { clients } from '../utils/serviceClient.js';

export const creditsRouter = Router();

creditsRouter.get('/balance', async (req, res, next) => {
  try {
    const { data } = await clients.creditsCurrency.get(`/api/v1/credits/${req.user.sub}/balance`);
    res.json(data);
  } catch (err) { next(err); }
});

creditsRouter.post('/convert', async (req, res, next) => {
  try {
    const { data } = await clients.creditsCurrency.post('/api/v1/credits/convert', {
      ...req.body, userId: req.user.sub,
    });
    res.json(data);
  } catch (err) { next(err); }
});

import { Router } from 'express';
import { redis } from '../utils/redis.js';
import { clients } from '../utils/serviceClient.js';

export const paymentsRouter = Router();

const cartKey = (userId) => `cart:${userId}`;

paymentsRouter.post('/intent', async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const raw = await redis.get(cartKey(userId));
    const cart = raw ? JSON.parse(raw) : { items: [] };

    if (!cart.items?.length) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const items = await Promise.all(cart.items.map(async (item) => {
      const { data: course } = await clients.courseCatalog.get(
        `/api/v1/courses/${encodeURIComponent(item.courseId)}`
      );

      if (!course || course.status !== 'published' || Number(course.price) <= 0) {
        throw new Error(`Course is unavailable or has an invalid price: ${item.courseId}`);
      }

      return {
        courseId: String(course._id),
        title: course.title,
        price: Number(course.price),
        currency: (course.currency || 'USD').toLowerCase(),
      };
    }));

    const currencies = [...new Set(items.map((item) => item.currency))];
    if (currencies.length !== 1) {
      return res.status(400).json({ error: 'All cart items must use the same currency' });
    }

    const amount = items.reduce((sum, item) => sum + item.price, 0);

    const { data } = await clients.payment.post('/api/v1/payments/intent', {
      userId, items, amount, currency: currencies[0],
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post('/:id/confirm', async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const { data: payment } = await clients.payment.post(
      `/api/v1/payments/${encodeURIComponent(req.params.id)}/confirm`,
      { userId }
    );

    if (!payment?.success || !Array.isArray(payment.items)) {
      return res.status(402).json({ error: 'Payment has not been verified' });
    }

    const results = await Promise.allSettled(
      payment.items.map((item) =>
        clients.enrollment.post('/api/v1/enrollments', {
          userId,
          courseId: item.courseId,
        })
      )
    );

    if (results.some((result) => result.status === 'rejected')) {
      return res.status(502).json({
        error: 'Payment was verified, but one or more enrollments need attention. Contact support.',
      });
    }

    const key = cartKey(userId);
    const raw = await redis.get(key);
    const cart = raw ? JSON.parse(raw) : { items: [] };
    const paidIds = new Set(payment.items.map((item) => String(item.courseId)));

    cart.items = cart.items.filter((item) => !paidIds.has(String(item.courseId)));
    cart.total = cart.items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    await redis.setEx(key, 3600, JSON.stringify(cart));

    res.json({ success: true, enrolledCourses: payment.items.length });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/history', async (req, res, next) => {
  try {
    const { data } = await clients.payment.get(
      `/api/v1/payments/user/${req.user.sub}`
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

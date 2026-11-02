import { Router } from 'express';
import { redis } from '../utils/redis.js';
import { clients } from '../utils/serviceClient.js';

export const cartRouter = Router();

function cartKey(userId) {
  return `cart:${userId}`;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Get cart
cartRouter.get('/', async (req, res, next) => {
  try {
    const raw = await redis.get(cartKey(req.user.sub));
    const cart = raw
      ? JSON.parse(raw)
      : { items: [], total: 0, discount: 0 };

    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// Add course using its official catalog price
cartRouter.post('/items', async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const response = await clients.courseCatalog.get(
      `/api/v1/courses/${encodeURIComponent(courseId)}`
    );

    const course = response.data;

    if (!course || course.status !== 'published') {
      return res.status(400).json({ error: 'Course is not available' });
    }

    const key = cartKey(req.user.sub);
    const raw = await redis.get(key);
    const cart = raw
      ? JSON.parse(raw)
      : { items: [], total: 0, discount: 0 };

    const existing = cart.items.find(
      (item) => item.courseId === courseId
    );

    if (!existing) {
      cart.items.push({
        id: `ci-${Date.now()}`,
        courseId: String(course._id),
        type: 'course',
        title: course.title,
        price: course.price,
        currency: course.currency || 'USD',
      });
    }

    cart.total = calculateTotal(cart.items);

    await redis.setEx(key, 3600, JSON.stringify(cart));

    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

// Remove cart item
cartRouter.delete('/items/:itemId', async (req, res, next) => {
  try {
    const key = cartKey(req.user.sub);
    const raw = await redis.get(key);

    if (!raw) {
      return res.json({ items: [], total: 0, discount: 0 });
    }

    const cart = JSON.parse(raw);

    cart.items = cart.items.filter(
      (item) => item.id !== req.params.itemId
    );

    cart.total = calculateTotal(cart.items);

    await redis.setEx(key, 3600, JSON.stringify(cart));

    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// Paid enrollment must go through verified Stripe payment.
cartRouter.post('/checkout', (req, res) => {
  res.status(410).json({
    error: 'Direct checkout is disabled. Use the verified payment flow.'
  });
});

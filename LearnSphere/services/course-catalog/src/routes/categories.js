import { Router } from 'express';
import { Course } from '../models/Course.js';

export const categoriesRouter = Router();

// GET /api/v1/categories — aggregated from course data
categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const result = await Course.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categories = result.map((r) => r._id).filter(Boolean);
    res.json({ categories });
  } catch (err) { next(err); }
});

import { Router } from 'express';
import { Course } from '../models/Course.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

export const coursesRouter = Router();

const QuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  sort: z.enum(['popular', 'newest', 'rating', 'price_asc', 'price_desc']).optional().default('popular'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

// GET /api/v1/courses
coursesRouter.get('/', async (req, res, next) => {
  try {
    const query = QuerySchema.parse(req.query);
    const filter = { status: 'published' };

    if (query.q) filter.$text = { $search: query.q };
    if (query.category) filter.category = query.category;
    if (query.level) filter.level = query.level;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    const sortMap = {
      popular: { enrolledCount: -1 },
      newest: { publishedAt: -1 },
      rating: { rating: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const skip = (query.page - 1) * query.limit;
    const [courses, total] = await Promise.all([
      Course.find(filter).sort(sortMap[query.sort]).skip(skip).limit(query.limit).lean(),
      Course.countDocuments(filter),
    ]);

    res.json({
      courses,
      total,
      page: query.page,
      pages: Math.ceil(total / query.limit),
      limit: query.limit,
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Invalid query', issues: err.issues });
    next(err);
  }
});

// GET /api/v1/courses/featured
coursesRouter.get('/featured', async (_req, res, next) => {
  try {
    const courses = await Course.find({ status: 'published', isFeatured: true })
      .sort({ enrolledCount: -1 })
      .limit(8)
      .lean();
    res.json({ courses });
  } catch (err) { next(err); }
});

// GET /api/v1/courses/search?q=
coursesRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ courses: [] });

    const courses = await Course.find(
      { status: 'published', $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20).lean();

    res.json({ courses, query: q });
  } catch (err) { next(err); }
});

// GET /api/v1/courses/:id
coursesRouter.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) { next(err); }
});

// POST /api/v1/courses (admin only — simplified)
coursesRouter.post('/', async (req, res, next) => {
  try {
    const course = new Course(req.body);
    await course.save();
    logger.info({ courseId: course._id }, 'Course created');
    res.status(201).json(course);
  } catch (err) { next(err); }
});

// PATCH /api/v1/courses/:id
coursesRouter.patch('/:id', async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) { next(err); }
});

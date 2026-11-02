import { Router } from 'express';
import { clients } from '../utils/serviceClient.js';

export const enrollmentsRouter = Router();

enrollmentsRouter.post('/', async (req, res, next) => {
  try {
    const { data } = await clients.enrollment.post('/api/v1/enrollments', {
      ...req.body,
      userId: req.user.sub,
    });
    res.status(201).json(data);
  } catch (err) { next(err); }
});

enrollmentsRouter.get('/me', async (req, res, next) => {
  try {
    const { data } = await clients.enrollment.get(`/api/v1/enrollments/user/${req.user.sub}`);
    const enrollments = data.enrollments ?? (Array.isArray(data) ? data : []);

    // Enrich each enrollment with real course title from course catalog
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        try {
          const { data: course } = await clients.courseCatalog.get(`/api/v1/courses/${e.courseId}`);
          return {
            ...e,
            course: {
              title: course.title || course.name || `Course ${e.courseId}`,
              durationHours: course.durationHours || course.duration || 0,
              category: course.category || '',
              thumbnail: course.thumbnail || '',
            },
          };
        } catch {
          return { ...e, course: { title: `Course ${e.courseId}`, durationHours: 0 } };
        }
      })
    );

    res.json({ enrollments: enriched });
  } catch (err) { next(err); }
});

enrollmentsRouter.patch('/:id/progress', async (req, res, next) => {
  try {
    const { data } = await clients.enrollment.patch(
      `/api/v1/enrollments/${req.params.id}/progress`,
      { ...req.body, userId: req.user.sub }
    );
    res.json(data);
  } catch (err) { next(err); }
});

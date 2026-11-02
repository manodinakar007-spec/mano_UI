import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import pg from 'pg';

const { Pool } = pg;
const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'enrollment' } });
const app = express();
const PORT = process.env.PORT || 9106;

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://skillfyme:skillfyme_secret@localhost:5432/skillfyme' });

app.use(helmet()); app.use(cors()); app.use(express.json()); app.use(pinoHttp({ logger }));

// Initialize schema
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(100) NOT NULL,
      course_id VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      completed_at TIMESTAMP,
      enrolled_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
  `);
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'enrollment' });
  } catch {
    res.status(503).json({ status: 'error', service: 'enrollment' });
  }
});

// GET /api/v1/enrollments/user/:userId
app.get('/api/v1/enrollments/user/:userId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, course_id, status, progress, enrolled_at, completed_at FROM enrollments WHERE user_id = $1 ORDER BY enrolled_at DESC`,
      [req.params.userId]
    );
    // Map to frontend-friendly shape
    const enrollments = rows.map((r) => ({
      id: r.id, userId: r.user_id, courseId: r.course_id,
      status: r.status, progress: r.progress,
      enrolledAt: r.enrolled_at, completedAt: r.completed_at,
      course: { title: `Course ${r.course_id}`, durationHours: 0 }, // enriched by BFF in prod
    }));
    res.json({ enrollments });
  } catch (err) { next(err); }
});

// POST /api/v1/enrollments
app.post('/api/v1/enrollments', async (req, res, next) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ error: 'userId and courseId required' });

    const { rows } = await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'active', updated_at = NOW()
       RETURNING *`,
      [userId, courseId]
    );
    logger.info({ userId, courseId }, 'User enrolled');
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/v1/enrollments/:id/progress
app.patch('/api/v1/enrollments/:id/progress', async (req, res, next) => {
  try {
    const { progress, userId } = req.body;
    if (progress < 0 || progress > 100) return res.status(400).json({ error: 'Progress must be 0–100' });

    const completedAt = progress === 100 ? 'NOW()' : 'NULL';
    const { rows } = await pool.query(
      `UPDATE enrollments SET progress = $1, updated_at = NOW(), completed_at = ${completedAt}
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [progress, req.params.id, userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ error: err.message });
});

initSchema()
  .then(() => app.listen(PORT, () => logger.info({ port: PORT }, 'Enrollment service started')))
  .catch((err) => { logger.error(err); process.exit(1); });

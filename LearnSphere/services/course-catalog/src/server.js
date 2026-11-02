import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import { logger } from './utils/logger.js';
import { coursesRouter } from './routes/courses.js';
import { categoriesRouter } from './routes/categories.js';

const app = express();
const PORT = process.env.PORT || 9101;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillfyme';

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health
app.get('/health', (_req, res) => res.json({
  status: 'ok', service: 'course-catalog',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}));

// Routes
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/categories', categoriesRouter);

// Error handler
app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Connect DB then start
mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => logger.info({ port: PORT }, 'Course Catalog service started'));
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to connect MongoDB');
    process.exit(1);
  });

export default app;

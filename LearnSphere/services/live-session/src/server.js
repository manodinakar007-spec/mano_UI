import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import pino from 'pino';
import { Session } from './models/Session.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'live-session' } });
const app = express();
const PORT = process.env.PORT || 9104;

app.use(helmet()); app.use(compression()); app.use(cors());
app.use(express.json()); app.use(pinoHttp({ logger }));

// Health
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'live-session', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);

// GET /api/v1/sessions
app.get('/api/v1/sessions', async (req, res, next) => {
  try {
    const { format, page = 1, limit = 12 } = req.query;
    const filter = { status: { $in: ['scheduled', 'live'] } };
    if (format) filter.format = format;
    const skip = (Number(page) - 1) * Number(limit);
    const [sessions, total] = await Promise.all([
      Session.find(filter).sort({ scheduledAt: 1 }).skip(skip).limit(Number(limit)).lean(),
      Session.countDocuments(filter),
    ]);
    res.json({ sessions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

// GET /api/v1/sessions/:id
app.get('/api/v1/sessions/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) { next(err); }
});

// POST /api/v1/sessions
app.post('/api/v1/sessions', async (req, res, next) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) { next(err); }
});

// POST /api/v1/sessions/:id/book
app.post('/api/v1/sessions/:id/book', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.enrolledCount >= session.capacity) {
      return res.status(409).json({ error: 'Session is full' });
    }
    const userId = req.body.userId;
    if (!session.enrolledUsers.includes(userId)) {
      session.enrolledUsers.push(userId);
      session.enrolledCount += 1;
      await session.save();
    }
    res.status(201).json({ message: 'Booking confirmed', sessionId: session._id });
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ error: err.message });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillfyme')
  .then(() => app.listen(PORT, () => logger.info({ port: PORT }, 'Live Session service started')))
  .catch((err) => { logger.error(err); process.exit(1); });

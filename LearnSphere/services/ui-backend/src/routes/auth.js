import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'skillfyme_dev_secret';
const JWT_EXPIRES = '7d';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2).max(100),
});

// In production this would delegate to a dedicated Identity service.
// For the demo, a minimal local implementation is provided.
authRouter.post('/login', async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);

    // TODO: delegate to identity-service / validate against user store
    const user = {
      id: 'demo-user-001',
      name: 'Demo Learner',
      email: body.email,
      role: 'learner',
    };

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.json({ user, token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    next(err);
  }
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = RegisterSchema.parse(req.body);

    const user = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: 'learner',
    };

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({ user, token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    next(err);
  }
});

authRouter.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    res.json({ user: { id: payload.sub, email: payload.email, role: payload.role } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

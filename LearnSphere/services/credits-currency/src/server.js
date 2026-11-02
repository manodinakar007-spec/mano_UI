import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import Redis from 'ioredis';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'credits-currency' } });
const app = express();
const PORT = process.env.PORT || 9105;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

// Static FX rates — in production these would be fetched from a live FX provider
const FX_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, CAD: 1.35,
  AUD: 1.52, JPY: 148.5, SGD: 1.34, AED: 3.67, BRL: 4.97,
};

// Skillfyme Credits conversion: 1 USD = 100 credits
const USD_PER_CREDIT = 0.01;

app.use(helmet()); app.use(cors()); app.use(express.json()); app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'credits-currency' })
);

// GET /api/v1/fx/rates
app.get('/api/v1/fx/rates', (_req, res) => {
  res.json({ rates: FX_RATES, base: 'USD', updatedAt: new Date().toISOString() });
});

// GET /api/v1/fx/convert?from=USD&to=EUR&amount=100
app.get('/api/v1/fx/convert', (req, res) => {
  const { from = 'USD', to = 'USD', amount } = req.query;
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt < 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!FX_RATES[from] || !FX_RATES[to]) return res.status(400).json({ error: 'Unsupported currency' });

  const usd = amt / FX_RATES[from];
  const converted = usd * FX_RATES[to];
  res.json({ from, to, amount: amt, converted: parseFloat(converted.toFixed(2)), rate: FX_RATES[to] / FX_RATES[from] });
});

// GET /api/v1/credits/:userId/balance
app.get('/api/v1/credits/:userId/balance', async (req, res, next) => {
  try {
    const key = `credits:${req.params.userId}`;
    const raw = await redis.get(key);
    const balance = raw ? parseInt(raw) : 0;
    res.json({ userId: req.params.userId, balance, usdEquivalent: (balance * USD_PER_CREDIT).toFixed(2) });
  } catch (err) { next(err); }
});

// POST /api/v1/credits/convert — deduct USD, add credits
app.post('/api/v1/credits/convert', async (req, res, next) => {
  try {
    const { userId, amountUsd } = req.body;
    if (!userId || !amountUsd) return res.status(400).json({ error: 'userId and amountUsd required' });
    const credits = Math.floor(amountUsd / USD_PER_CREDIT);
    await redis.incrby(`credits:${userId}`, credits);
    const newBalance = parseInt(await redis.get(`credits:${userId}`));
    res.json({ userId, creditsAdded: credits, newBalance });
  } catch (err) { next(err); }
});

// POST /api/v1/credits/spend
app.post('/api/v1/credits/spend', async (req, res, next) => {
  try {
    const { userId, amount } = req.body;
    const key = `credits:${userId}`;
    const current = parseInt(await redis.get(key) || '0');
    if (current < amount) return res.status(400).json({ error: 'Insufficient credits', balance: current });
    await redis.decrby(key, amount);
    const newBalance = parseInt(await redis.get(key));
    res.json({ userId, creditsSpent: amount, newBalance });
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => logger.info({ port: PORT }, 'Credits & Currency service started'));

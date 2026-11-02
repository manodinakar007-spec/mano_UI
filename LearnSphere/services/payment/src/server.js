import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import pg from 'pg';
import Stripe from 'stripe';

const { Pool } = pg;
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const PORT = process.env.PORT || 9107;

if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
  throw new Error('A Stripe test secret key is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://skillfyme:skillfyme_secret@localhost:5432/skillfyme',
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(100) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      status VARCHAR(50) DEFAULT 'pending',
      provider VARCHAR(50) DEFAULT 'stripe',
      provider_payment_id VARCHAR(255),
      items JSONB DEFAULT '[]',
      coupon_code VARCHAR(100),
      discount NUMERIC(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session
      ON payments(stripe_session_id)
      WHERE stripe_session_id IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
  `);
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'payment' });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

// Create Stripe Checkout Session
app.post('/api/v1/payments/intent', async (req, res, next) => {
  try {
    const { userId, items, amount, currency = 'USD' } = req.body;

    if (!userId || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'User and cart items are required' });
    }

    const totalCents = Math.round(Number(amount) * 100);

    if (!Number.isInteger(totalCents) || totalCents <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: Math.round(Number(item.price) * 100),
          product_data: {
            name: item.title,
          },
        },
      })),
      success_url: `${process.env.FRONTEND_URL || 'http://13.233.41.57:3000'}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://13.233.41.57:3000'}/checkout?payment=cancelled`,
      metadata: {
        userId: String(userId),
      },
    });

    await pool.query(
      `INSERT INTO payments
       (user_id, amount, currency, status, provider_payment_id,
        stripe_session_id, items)
       VALUES ($1,$2,$3,'pending',$4,$4,$5)`,
      [userId, amount, currency, session.id, JSON.stringify(items)]
    );

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
});

// Verify Stripe Checkout Session
app.post('/api/v1/payments/:id/confirm', async (req, res, next) => {
  try {
    const { userId } = req.body;

    const result = await pool.query(
      'SELECT * FROM payments WHERE stripe_session_id=$1 AND user_id=$2',
      [req.params.id, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.rows[0];
    const session = await stripe.checkout.sessions.retrieve(req.params.id);

    if (
      session.metadata?.userId !== String(userId) ||
      session.payment_status !== 'paid' ||
      session.status !== 'complete'
    ) {
      return res.status(402).json({ error: 'Payment has not been verified' });
    }

    if (
      Number(session.amount_total) !== Math.round(Number(payment.amount) * 100) ||
      String(session.currency).toLowerCase() !== String(payment.currency).toLowerCase()
    ) {
      return res.status(400).json({ error: 'Payment amount or currency mismatch' });
    }

    await pool.query(
      `UPDATE payments
       SET status='completed', updated_at=NOW()
       WHERE stripe_session_id=$1 AND user_id=$2`,
      [req.params.id, userId]
    );

    res.json({
      success: true,
      paymentId: payment.id,
      items: payment.items,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/payments/user/:userId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, amount, currency, status, created_at, items
       FROM payments WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json({ payments: rows });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ error: 'Payment service error' });
});

initSchema()
  .then(() => app.listen(PORT, () =>
    logger.info({ port: PORT }, 'Payment service started')
  ))
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });

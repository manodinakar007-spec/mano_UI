import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import nodemailer from 'nodemailer';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'notification' } });
const app = express();
const PORT = process.env.PORT || 9108;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

app.use(helmet()); app.use(cors()); app.use(express.json()); app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification' }));

// POST /api/v1/notifications/email
app.post('/api/v1/notifications/email', async (req, res, next) => {
  try {
    const { to, subject, template, data } = req.body;
    if (!to || !subject || !template) return res.status(400).json({ error: 'to, subject, template required' });

    const html = renderTemplate(template, data);

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@skillfyme.com',
      to,
      subject,
      html,
    });

    logger.info({ to, template }, 'Email sent');
    res.json({ success: true, message: 'Email sent' });
  } catch (err) { next(err); }
});

// POST /api/v1/notifications/send — generic notification
app.post('/api/v1/notifications/send', async (req, res, next) => {
  try {
    const { userId, type, title, message, channels = ['email'] } = req.body;
    logger.info({ userId, type, channels }, 'Notification dispatched');
    // In production: route to Kafka and consume per-channel workers
    res.json({ success: true, queued: true, channels });
  } catch (err) { next(err); }
});

function renderTemplate(template, data = {}) {
  const templates = {
    enrollment_confirmation: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Welcome to ${data.courseTitle || 'your new course'}! 🎉</h2>
        <p>Hi ${data.userName || 'Learner'},</p>
        <p>You're now enrolled. Start learning at your own pace.</p>
        <a href="${data.courseUrl || '#'}" style="background:#4066ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Start Learning</a>
        <p style="color:#666;margin-top:24px;">The Skillfyme Team</p>
      </div>
    `,
    payment_receipt: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Payment Receipt</h2>
        <p>Hi ${data.userName || 'Learner'},</p>
        <p>Your payment of <strong>${data.currency} ${data.amount}</strong> was successful.</p>
        <p>Order ID: <code>${data.orderId}</code></p>
        <p style="color:#666;">The Skillfyme Team</p>
      </div>
    `,
    session_reminder: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Session Reminder 🔔</h2>
        <p>Hi ${data.userName || 'Learner'},</p>
        <p>Your live session <strong>${data.sessionTitle}</strong> starts in 1 hour.</p>
        <a href="${data.joinUrl || '#'}" style="background:#4066ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Join Session</a>
        <p style="color:#666;">The Skillfyme Team</p>
      </div>
    `,
    default: `<div style="font-family:sans-serif;"><h2>${data.title || 'Notification'}</h2><p>${data.message || ''}</p></div>`,
  };
  return templates[template] || templates.default;
}

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => logger.info({ port: PORT }, 'Notification service started'));

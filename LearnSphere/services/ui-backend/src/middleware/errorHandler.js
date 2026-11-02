import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.response?.status || 500;
  const message = err.message || 'Internal server error';

  logger.error({ err, path: req.path, method: req.method, status }, 'Request error');

  res.status(status).json({
    error: message,
    path: req.path,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

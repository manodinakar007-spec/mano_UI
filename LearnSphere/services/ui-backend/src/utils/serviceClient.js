import axios from 'axios';
import { logger } from './logger.js';

const SERVICES = {
  courseCatalog: process.env.COURSE_CATALOG_URL || 'http://localhost:9101',
  learningPath: process.env.LEARNING_PATH_URL || 'http://localhost:9102',
  assessmentEngine: process.env.ASSESSMENT_ENGINE_URL || 'http://localhost:9103',
  liveSession: process.env.LIVE_SESSION_URL || 'http://localhost:9104',
  creditsCurrency: process.env.CREDITS_CURRENCY_URL || 'http://localhost:9105',
  enrollment: process.env.ENROLLMENT_URL || 'http://localhost:9106',
  payment: process.env.PAYMENT_URL || 'http://localhost:9107',
  notification: process.env.NOTIFICATION_URL || 'http://localhost:9108',
};

function createServiceClient(baseURL, serviceName) {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'X-Internal-Service': 'ui-backend', 'Content-Type': 'application/json' },
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      logger.error(
        { service: serviceName, status: err.response?.status, url: err.config?.url },
        'Downstream service error'
      );
      return Promise.reject(err);
    }
  );

  return client;
}

export const clients = {
  courseCatalog: createServiceClient(SERVICES.courseCatalog, 'course-catalog'),
  learningPath: createServiceClient(SERVICES.learningPath, 'learning-path'),
  assessmentEngine: createServiceClient(SERVICES.assessmentEngine, 'assessment-engine'),
  liveSession: createServiceClient(SERVICES.liveSession, 'live-session'),
  creditsCurrency: createServiceClient(SERVICES.creditsCurrency, 'credits-currency'),
  enrollment: createServiceClient(SERVICES.enrollment, 'enrollment'),
  payment: createServiceClient(SERVICES.payment, 'payment'),
  notification: createServiceClient(SERVICES.notification, 'notification'),
};

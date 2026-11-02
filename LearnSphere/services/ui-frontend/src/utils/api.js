import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Course Catalog
export const courseApi = {
  list: (params) => api.get('/courses', { params }),
  get: (id) => api.get(`/courses/${id}`),
  search: (q) => api.get('/courses/search', { params: { q } }),
  categories: () => api.get('/courses/categories'),
  featured: () => api.get('/courses/featured'),
};

// Learning Paths
export const pathApi = {
  list: (params) => api.get('/learning-paths', { params }),
  get: (id) => api.get(`/learning-paths/${id}`),
};

// Live Sessions
export const sessionApi = {
  list: (params) => api.get('/live-sessions', { params }),
  get: (id) => api.get(`/live-sessions/${id}`),
  book: (id, data) => api.post(`/live-sessions/${id}/book`, data),
};

// Enrollment
export const enrollmentApi = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  myEnrollments: () => api.get('/enrollments/me'),
  progress: (enrollmentId, data) => api.patch(`/enrollments/${enrollmentId}/progress`, data),
};

// Cart & Checkout
export const cartApi = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart/items', item),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  checkout: (data) => api.post('/cart/checkout', data),
};

// Payment
export const paymentApi = {
  createIntent: (data) => api.post('/payments/intent', data),
  confirm: (paymentId) => api.post(`/payments/${paymentId}/confirm`),
  history: () => api.get('/payments/history'),
};

// Credits
export const creditsApi = {
  balance: () => api.get('/credits/balance'),
  convert: (amount, currency) => api.post('/credits/convert', { amount, currency }),
};

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export default api;

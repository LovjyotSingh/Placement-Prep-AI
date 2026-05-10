import axios from 'axios';
import { clearAuth, getToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 (expired token) automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || '';
    const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (!err.response) {
      err.friendlyMessage = 'The server is starting or temporarily unavailable. Please try again in a minute.';
    }

    if (err.response?.status === 401 && !isAuthAttempt) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.friendlyMessage || fallback;
}

export default api;

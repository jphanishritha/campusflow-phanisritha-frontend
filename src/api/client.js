import axios from 'axios';

const TOKEN_KEY = 'cf_token';

const baseURL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1')).replace(/\/+$/, '');

if (!import.meta.env.VITE_API_BASE_URL && !import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.error('VITE_API_BASE_URL is not set. Set it in your hosting environment and rebuild.');
}

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

const api = axios.create({ baseURL, timeout: 30000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/')) {
      tokenStore.clear();
      window.dispatchEvent(new Event('cf:unauthorized'));
    }
    return Promise.reject(err);
  },
);

/** Turn any axios error into a readable message. */
export function errMsg(err) {
  if (err?.response?.data) {
    const d = err.response.data;
    if (d.fieldErrors && Object.keys(d.fieldErrors).length) return Object.values(d.fieldErrors)[0];
    if (d.message) return d.message;
  }
  if (err?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (err?.message === 'Network Error') return 'Cannot reach the server. Check your connection or the API URL.';
  return err?.message || 'Something went wrong';
}

export function fieldErrors(err) {
  return err?.response?.data?.fieldErrors || {};
}

export const AuthAPI = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/users/me').then((r) => r.data),
  updateMe: (data) => api.put('/users/me', data).then((r) => r.data),
};

export const ProjectAPI = {
  list: (params) => api.get('/projects', { params }).then((r) => r.data),
  get: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data) => api.post('/projects', data).then((r) => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`),
  members: (id) => api.get(`/projects/${id}/members`).then((r) => r.data),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data).then((r) => r.data),
  updateMember: (id, memberId, data) => api.put(`/projects/${id}/members/${memberId}`, data).then((r) => r.data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`),
  tasks: (id, params) => api.get(`/projects/${id}/tasks`, { params }).then((r) => r.data),
  createTask: (id, data) => api.post(`/projects/${id}/tasks`, data).then((r) => r.data),
};

export const TaskAPI = {
  mine: () => api.get('/tasks/mine').then((r) => r.data),
  get: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const UserAPI = {
  search: (q) => api.get('/users/search', { params: { q } }).then((r) => r.data),
};

export const InsightAPI = {
  dashboard: () => api.get('/dashboard').then((r) => r.data),
  analytics: () => api.get('/analytics').then((r) => r.data),
  team: () => api.get('/team').then((r) => r.data),
};

export default api;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. Session expired.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const securePaths = ['/citizen', '/authority', '/worker', '/certification', '/explorer'];
      if (securePaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  getWorkers: () => api.get('/users/workers'),
  getCitizens: () => api.get('/users/citizens'),
  createWorker: (data) => api.post('/users/workers', data),
  getLeaderboard: () => api.get('/users/leaderboard'),
  getProfile: () => api.get('/users/profile'),
};

export const academyAPI = {
  getModules: () => api.get('/academy'),
  submitQuiz: (id, answers) => api.post(`/academy/${id}/submit`, { answers }),
};

export const certificationAPI = {
  download: () => api.get('/certification/download', { responseType: 'blob' }),
  getLedger: () => api.get('/certification/ledger'),
};

export const reportAPI = {
  getAll: () => api.get('/reports'),
  getStats: () => api.get('/reports/stats'),
  getAuditTrail: (id) => api.get(`/reports/${id}/audit`),
  updateStatus: (id, status, extraData = {}) => api.put(`/reports/${id}`, { status, ...extraData }),
  assignWorker: (id, workerId) => api.put(`/reports/${id}`, { assignedWorker: workerId, status: 'ASSIGNED' }),
  create: (data) => api.post('/reports', data),
};

export default api;

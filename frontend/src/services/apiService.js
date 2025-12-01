import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Ajustez selon votre backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentification
  loginPilgrim: (credentials) => api.post('/auth/login', credentials),
  registerPilgrim: (data) => api.post('/pilgrims', data), // Route existante
  logoutPilgrim: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  
  // Validation et vérification
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Stats
  getStats: () => api.get('/stats'),
  
  // Events
  getEvents: () => api.get('/events'),
  getUpcomingEvents: () => api.get('/upcoming-events'),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  
  // Pilgrims
  getPilgrims: () => api.get('/pilgrims'),
  createPilgrim: (data) => api.post('/pilgrims', data),
  updatePilgrim: (id, data) => api.put(`/pilgrims/${id}`, data),
  deletePilgrim: (id) => api.delete(`/pilgrims/${id}`),
  getPilgrimProfile: () => api.get('/pilgrims/profile'),
  updatePilgrimProfile: (data) => api.put('/pilgrims/profile', data),
  
  // Points of Interest
  getPointsInterest: () => api.get('/points-interest'),
  createPointInterest: (data) => api.post('/points-interest', data),
  updatePointInterest: (id, data) => api.put(`/points-interest/${id}`, data),
  deletePointInterest: (id) => api.delete(`/points-interest/${id}`),
  
  // Admin functions
  getAllPilgrims: () => api.get('/admin/pilgrims'),
  updatePilgrimStatus: (id, status) => api.put(`/admin/pilgrims/${id}/status`, { status }),
  getAdminStats: () => api.get('/admin/stats'),
  
  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  
  // User preferences
  getUserPreferences: () => api.get('/user/preferences'),
  updateUserPreferences: (data) => api.put('/user/preferences', data),
};

export default apiService;
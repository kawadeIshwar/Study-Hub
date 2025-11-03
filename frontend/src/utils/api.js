import axios from 'axios';

// Base URL for your backend API - uses environment variable
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we have a token (authenticated request that failed)
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Only redirect if not accessing public endpoints
      const publicEndpoints = ['/communities', '/auth/'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        error.config.url.includes(endpoint)
      );
      if (!isPublicEndpoint) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

export const notesAPI = {
  getAll: () => api.get('/upload/all'),
  upload: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/notes/${id}`),
};

export default api;

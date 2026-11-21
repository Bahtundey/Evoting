import api from './api';

// POST /api/auth/register
export const register = (payload) => api.post('/auth/register', payload);

// POST /api/auth/login
export const login = (email, password) => api.post('/auth/login', { email, password });

// GET /api/auth/me
export const getMe = () => api.get('/auth/me');

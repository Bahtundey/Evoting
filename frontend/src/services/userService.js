import api from './api';

// GET /api/users (admin)
export const getUsers = () => api.get('/users');

// GET /api/users/:id
export const getUser = (id) => api.get(`/users/${id}`);

// PUT /api/users/:id
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload);

// PATCH /api/users/:id/status { isActive }
export const updateUserStatus = (id, isActive) =>
  api.patch(`/users/${id}/status`, { isActive });

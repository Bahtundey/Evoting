import api from './api';

// GET /api/elections
export const getElections = () => api.get('/elections');

// GET /api/elections/:id
export const getElection = (id) => api.get(`/elections/${id}`);

// POST /api/elections
export const createElection = (payload) => api.post('/elections', payload);

// PUT /api/elections/:id
export const updateElection = (id, payload) => api.put(`/elections/${id}`, payload);

// DELETE /api/elections/:id
export const deleteElection = (id) => api.delete(`/elections/${id}`);

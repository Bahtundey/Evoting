import api from './api';

// GET /api/candidates (optionally filtered by election id)
export const getCandidates = (electionId) =>
  api.get('/candidates', { params: electionId ? { election: electionId } : {} });

// GET /api/candidates/:id
export const getCandidate = (id) => api.get(`/candidates/${id}`);

// POST /api/candidates
export const createCandidate = (payload) => api.post('/candidates', payload);

// PUT /api/candidates/:id
export const updateCandidate = (id, payload) => api.put(`/candidates/${id}`, payload);

// DELETE /api/candidates/:id
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`);

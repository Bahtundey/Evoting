import api from './api';

// POST /api/votes  { election, candidate }
export const castVote = (electionId, candidateId) =>
  api.post('/votes', { election: electionId, candidate: candidateId });

// GET /api/votes/results/:electionId
export const getResults = (electionId) => api.get(`/votes/results/${electionId}`);

const express = require('express');
const { body, param } = require('express-validator');
const { castVote, getResults } = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

// POST /api/votes — authenticated voter
router.post(
  '/',
  authMiddleware,
  [
    body('election').isMongoId().withMessage('A valid election id is required'),
    body('candidate').isMongoId().withMessage('A valid candidate id is required'),
  ],
  validateRequest,
  castVote
);

// GET /api/votes/results/:electionId — public, gated on publish
router.get(
  '/results/:electionId',
  param('electionId').isMongoId().withMessage('Invalid election id'),
  validateRequest,
  getResults
);

module.exports = router;

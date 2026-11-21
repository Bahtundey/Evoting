const express = require('express');
const { body, param } = require('express-validator');
const {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

// Public reads
router.get('/', getCandidates);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid candidate id'),
  validateRequest,
  getCandidateById
);

// Admin-only writes
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    body('fullName').trim().notEmpty().withMessage('fullName is required'),
    body('party').trim().notEmpty().withMessage('party is required'),
    body('election').isMongoId().withMessage('A valid election id is required'),
  ],
  validateRequest,
  createCandidate
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [param('id').isMongoId().withMessage('Invalid candidate id')],
  validateRequest,
  updateCandidate
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [param('id').isMongoId().withMessage('Invalid candidate id')],
  validateRequest,
  deleteCandidate
);

module.exports = router;

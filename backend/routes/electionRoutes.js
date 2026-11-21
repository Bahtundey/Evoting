const express = require('express');
const { body, param } = require('express-validator');
const {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
} = require('../controllers/electionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

const createDateValidators = [
  body('startDate').isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').isISO8601().withMessage('endDate must be a valid date'),
  body('endDate').custom((value, { req }) => {
    if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
      throw new Error('endDate must be after startDate');
    }
    return true;
  }),
];

const updateDateValidators = [
  body('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
];

// Public reads
router.get('/', getElections);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid election id'),
  validateRequest,
  getElectionById
);

// Admin-only writes
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    ...createDateValidators,
  ],
  validateRequest,
  createElection
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid election id'),
    ...updateDateValidators,
    body('status')
      .optional()
      .isIn(['upcoming', 'active', 'completed'])
      .withMessage('Status must be "upcoming", "active" or "completed"'),
    body('resultsPublished')
      .optional()
      .isBoolean()
      .withMessage('resultsPublished must be a boolean'),
  ],
  validateRequest,
  updateElection
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [param('id').isMongoId().withMessage('Invalid election id')],
  validateRequest,
  deleteElection
);

module.exports = router;

const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

// Every user route requires an authenticated user.
router.use(authMiddleware);

// GET /api/users — admin only
router.get('/', adminMiddleware, getUsers);

// GET /api/users/:id — admin or self
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid user id'),
  validateRequest,
  getUserById
);

// PUT /api/users/:id — admin manages others; voter updates own profile
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('email').optional().isEmail().withMessage('A valid email is required'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['voter', 'admin'])
      .withMessage('Role must be "voter" or "admin"'),
  ],
  validateRequest,
  updateUser
);

// PATCH /api/users/:id/status — admin only
router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  ],
  validateRequest,
  adminMiddleware,
  updateUserStatus
);

module.exports = router;

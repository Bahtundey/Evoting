const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users  (admin only)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: 'Users retrieved',
    data: users.map((user) => user.toPublicJSON()),
  });
});

// GET /api/users/:id  (admin, or the user themselves)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user._id.toString() === user._id.toString();

  if (!isAdmin && !isSelf) {
    return res
      .status(403)
      .json({ success: false, message: 'You can only view your own profile' });
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved',
    data: user.toPublicJSON(),
  });
});

// PUT /api/users/:id  (admin manages others; a voter updates their own profile)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user._id.toString() === user._id.toString();

  if (!isAdmin && !isSelf) {
    return res
      .status(403)
      .json({ success: false, message: 'You can only update your own profile' });
  }

  const { fullName, email, password, registrationNumber, role } = req.body;

  // Fields everyone may change on their own account (and admins on anyone's).
  if (fullName !== undefined) user.fullName = fullName;
  if (email !== undefined) user.email = email;

  // Admin-only fields.
  if (isAdmin) {
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber;
    if (role !== undefined) {
      if (!['voter', 'admin'].includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: 'Role must be "voter" or "admin"' });
      }
      user.role = role;
    }
  }

  // Optional password change (re-hashed by the pre-save hook).
  if (password !== undefined && password !== '') {
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated',
    data: user.toPublicJSON(),
  });
});

// PATCH /api/users/:id/status  (admin only) — activate / deactivate an account
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent an admin from locking themselves out.
  if (req.user._id.toString() === user._id.toString()) {
    return res
      .status(400)
      .json({ success: false, message: 'You cannot change your own account status' });
  }

  const { isActive } = req.body;
  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'}`,
    data: user.toPublicJSON(),
  });
});

module.exports = { getUsers, getUserById, updateUser, updateUserStatus };

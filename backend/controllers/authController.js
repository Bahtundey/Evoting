const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, registrationNumber } = req.body;

  // Friendly pre-checks for clear messages; the unique indexes are the
  // real guarantee against duplicates (races surface as 409 via the handler).
  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    return res
      .status(409)
      .json({ success: false, message: 'An account with this email already exists' });
  }

  const regExists = await User.findOne({ registrationNumber });
  if (regExists) {
    return res
      .status(409)
      .json({ success: false, message: 'An account with this registration number already exists' });
  }

  // The role is ALWAYS forced to 'voter' on public registration — an admin
  // role can never be granted from a public request.
  const user = await User.create({
    fullName,
    email,
    password,
    registrationNumber,
    role: 'voter',
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user: user.toPublicJSON() },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res
      .status(403)
      .json({ success: false, message: 'Account is deactivated' });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { token: generateToken(user), user: user.toPublicJSON() },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user',
    data: req.user.toPublicJSON(),
  });
});

module.exports = { register, login, getMe };

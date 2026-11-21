const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the Bearer token, loads the user from the database and attaches
 * it to `req.user`. Rejects missing/invalid/expired tokens and inactive
 * accounts. Must be placed before any route that requires authentication.
 */
const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token provided' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, user not found' });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
};

module.exports = authMiddleware;

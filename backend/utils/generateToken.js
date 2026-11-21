const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for the given user. The payload is minimal (id + role);
 * the auth middleware re-loads the user from the database on each request.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;

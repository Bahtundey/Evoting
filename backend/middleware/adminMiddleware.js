/**
 * Role-based authorization: requires an authenticated user (authMiddleware
 * must run first) with the admin role. Used on every admin-only route.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, message: 'Access denied, administrator only' });
};

module.exports = adminMiddleware;

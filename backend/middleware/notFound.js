/**
 * 404 handler — runs for any route not matched above,
 * then forwards to the centralized error handler.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = notFound;

/**
 * Centralized error handler.
 * - Honors a status already set on the error (400 from express.json on
 *   malformed JSON, 404 from notFound), otherwise falls back to 500.
 * - Maps MongoDB duplicate-key errors (code 11000) to 409 Conflict.
 */
const errorMiddleware = (err, req, res, next) => {
  // Duplicate key from a unique index (e.g. email, registration number,
  // or the voter/election compound index) -> 409.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  const statusCode =
    err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
  });
};

module.exports = errorMiddleware;

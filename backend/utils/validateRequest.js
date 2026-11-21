const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains; returns a single 400 with every
 * validation message joined if any rule failed, otherwise continues.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  next();
};

module.exports = validateRequest;

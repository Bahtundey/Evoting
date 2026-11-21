const mongoose = require('mongoose');

// Map Mongoose connection readyState to a readable string
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/**
 * GET /api/health
 * Reports API uptime and database connection status.
 */
const getHealth = (req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'E-Voting Platform API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbState,
    },
  });
};

module.exports = { getHealth };

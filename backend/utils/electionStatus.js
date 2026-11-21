/**
 * Single source of truth for deriving an election's status from its dates.
 * Used by the Election model, the controllers and the vote/result logic so
 * the status is always computed consistently.
 */
const computeStatus = (startDate, endDate) => {
  const now = new Date();
  if (now < new Date(startDate)) return 'upcoming';
  if (now > new Date(endDate)) return 'completed';
  return 'active';
};

module.exports = { computeStatus };

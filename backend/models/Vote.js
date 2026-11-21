const mongoose = require('mongoose');

/**
 * Anonymous ballot. Stores a selection WITHOUT any reference to the voter,
 * so no API can expose a voter -> candidate mapping.
 *
 * Voter participation / duplicate-vote prevention is tracked separately in
 * the VoterRecord model (see section 6 of the spec on ballot secrecy).
 */
const voteSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
  },
  { timestamps: true }
);

// Speeds up the per-election results aggregation.
voteSchema.index({ election: 1 });

module.exports = mongoose.model('Vote', voteSchema);

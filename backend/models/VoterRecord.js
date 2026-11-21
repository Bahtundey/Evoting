const mongoose = require('mongoose');

/**
 * Voter participation record. Records that a voter voted in an election,
 * but carries NO candidate reference — preserving ballot secrecy.
 *
 * The unique compound index on { election, voter } is the database-level
 * guarantee that a voter can only vote once per election, including under
 * concurrent requests (duplicate inserts throw error code 11000).
 */
const voterRecordSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

voterRecordSchema.index({ election: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('VoterRecord', voterRecordSchema);

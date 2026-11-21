const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    party: { type: String, required: true, trim: true },
    biography: { type: String, default: '' },
    photo: { type: String, default: '' },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);

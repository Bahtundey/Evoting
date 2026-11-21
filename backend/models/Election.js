const mongoose = require('mongoose');
const { computeStatus } = require('../utils/electionStatus');

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
    // When true, the admin set `status` explicitly and it is NOT
    // auto-derived from the dates.
    statusManuallySet: { type: Boolean, default: false },
    // Lets an admin publish results before the end date.
    resultsPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Keep the stored status consistent with the dates unless it was set manually.
electionSchema.pre('save', function (next) {
  if (!this.statusManuallySet) {
    this.status = computeStatus(this.startDate, this.endDate);
  }
  next();
});

// Effective status for reads (recomputed from dates unless manually set).
electionSchema.methods.getEffectiveStatus = function () {
  return this.statusManuallySet
    ? this.status
    : computeStatus(this.startDate, this.endDate);
};

module.exports = mongoose.model('Election', electionSchema);

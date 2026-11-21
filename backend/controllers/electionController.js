const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { computeStatus } = require('../utils/electionStatus');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/elections  (public)
const getElections = asyncHandler(async (req, res) => {
  const elections = await Election.find()
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email');

  const data = elections.map((election) => ({
    _id: election._id,
    title: election.title,
    description: election.description,
    startDate: election.startDate,
    endDate: election.endDate,
    status: election.getEffectiveStatus(),
    resultsPublished: election.resultsPublished,
    createdBy: election.createdBy,
    createdAt: election.createdAt,
    updatedAt: election.updatedAt,
  }));

  res.status(200).json({ success: true, message: 'Elections retrieved', data });
});

// GET /api/elections/:id  (public)
const getElectionById = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id).populate(
    'createdBy',
    'fullName email'
  );
  if (!election) {
    return res.status(404).json({ success: false, message: 'Election not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Election retrieved',
    data: {
      _id: election._id,
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      status: election.getEffectiveStatus(),
      resultsPublished: election.resultsPublished,
      createdBy: election.createdBy,
      createdAt: election.createdAt,
      updatedAt: election.updatedAt,
    },
  });
});

// POST /api/elections  (admin only)
const createElection = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const manuallySet = status && ['upcoming', 'active', 'completed'].includes(status);

  const election = await Election.create({
    title,
    description,
    startDate: start,
    endDate: end,
    status: manuallySet ? status : computeStatus(start, end),
    statusManuallySet: !!manuallySet,
    resultsPublished: false,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Election created', data: election });
});

// PUT /api/elections/:id  (admin only)
const updateElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) {
    return res.status(404).json({ success: false, message: 'Election not found' });
  }

  const { title, description, startDate, endDate, status, resultsPublished } = req.body;

  if (title !== undefined) election.title = title;
  if (description !== undefined) election.description = description;

  const newStart = startDate !== undefined ? new Date(startDate) : election.startDate;
  const newEnd = endDate !== undefined ? new Date(endDate) : election.endDate;

  if (newEnd <= newStart) {
    return res
      .status(400)
      .json({ success: false, message: 'endDate must be after startDate' });
  }

  election.startDate = newStart;
  election.endDate = newEnd;

  if (status !== undefined) {
    if (!['upcoming', 'active', 'completed'].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Status must be "upcoming", "active" or "completed"' });
    }
    election.status = status;
    election.statusManuallySet = true;
  } else {
    // No explicit status: go back to date-derived status.
    election.statusManuallySet = false;
    election.status = computeStatus(newStart, newEnd);
  }

  if (resultsPublished !== undefined) {
    election.resultsPublished = !!resultsPublished;
  }

  await election.save();

  res.status(200).json({ success: true, message: 'Election updated', data: election });
});

// DELETE /api/elections/:id  (admin only)
const deleteElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) {
    return res.status(404).json({ success: false, message: 'Election not found' });
  }

  const voteCount = await Vote.countDocuments({ election: election._id });
  if (voteCount > 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Cannot delete an election that has recorded votes' });
  }

  // Remove the election's candidates along with it.
  await Candidate.deleteMany({ election: election._id });
  await election.deleteOne();

  res.status(200).json({ success: true, message: 'Election deleted', data: {} });
});

module.exports = {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
};

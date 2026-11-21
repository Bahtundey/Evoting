const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// GET /api/candidates  (public; optional ?election=<id> filter)
const getCandidates = asyncHandler(async (req, res) => {
  const { election } = req.query;
  if (election && !mongoose.isValidObjectId(election)) {
    return res.status(400).json({ success: false, message: 'Invalid election id' });
  }
  const filter = {};
  if (election) filter.election = election;

  const candidates = await Candidate.find(filter)
    .populate('election', 'title status startDate endDate')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Candidates retrieved', data: candidates });
});

// GET /api/candidates/:id  (public)
const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id).populate(
    'election',
    'title status startDate endDate'
  );
  if (!candidate) {
    return res.status(404).json({ success: false, message: 'Candidate not found' });
  }

  res.status(200).json({ success: true, message: 'Candidate retrieved', data: candidate });
});

// POST /api/candidates  (admin only)
const createCandidate = asyncHandler(async (req, res) => {
  const { fullName, party, biography, photo, election } = req.body;

  const electionDoc = await Election.findById(election);
  if (!electionDoc) {
    return res.status(404).json({ success: false, message: 'Election not found' });
  }

  const candidate = await Candidate.create({ fullName, party, biography, photo, election });

  res.status(201).json({ success: true, message: 'Candidate created', data: candidate });
});

// PUT /api/candidates/:id  (admin only)
const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({ success: false, message: 'Candidate not found' });
  }

  const { fullName, party, biography, photo, election } = req.body;

  if (fullName !== undefined) candidate.fullName = fullName;
  if (party !== undefined) candidate.party = party;
  if (biography !== undefined) candidate.biography = biography;
  if (photo !== undefined) candidate.photo = photo;

  if (election !== undefined) {
    const electionDoc = await Election.findById(election);
    if (!electionDoc) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    candidate.election = election;
  }

  await candidate.save();

  res.status(200).json({ success: true, message: 'Candidate updated', data: candidate });
});

// DELETE /api/candidates/:id  (admin only)
const deleteCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return res.status(404).json({ success: false, message: 'Candidate not found' });
  }

  const voteCount = await Vote.countDocuments({ candidate: candidate._id });
  if (voteCount > 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Cannot delete a candidate that has recorded votes' });
  }

  await candidate.deleteOne();

  res.status(200).json({ success: true, message: 'Candidate deleted', data: {} });
});

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
};

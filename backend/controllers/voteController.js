const Vote = require('../models/Vote');
const VoterRecord = require('../models/VoterRecord');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const { computeStatus } = require('../utils/electionStatus');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/votes  (authenticated voter)
const castVote = asyncHandler(async (req, res) => {
  const { election: electionId, candidate: candidateId } = req.body;

  // Administrators can never cast a vote through ordinary voter functionality.
  if (req.user.role !== 'voter') {
    return res
      .status(403)
      .json({ success: false, message: 'Only registered voters can cast a vote' });
  }

  const election = await Election.findById(electionId);
  if (!election) {
    return res.status(404).json({ success: false, message: 'Election not found' });
  }

  const status = computeStatus(election.startDate, election.endDate);
  if (status !== 'active') {
    return res.status(400).json({
      success: false,
      message: `Election is ${status}; voting is only allowed while it is active`,
    });
  }

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    return res.status(404).json({ success: false, message: 'Candidate not found' });
  }

  if (candidate.election.toString() !== election._id.toString()) {
    return res
      .status(400)
      .json({ success: false, message: 'Candidate does not belong to this election' });
  }

  // 1) Record participation first. The unique compound index on
  //    { election, voter } atomically rejects duplicate votes — including
  //    concurrent ones — by throwing a duplicate-key error (code 11000).
  let voterRecord;
  try {
    voterRecord = await VoterRecord.create({ election: election._id, voter: req.user._id });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'You have already voted in this election' });
    }
    throw error;
  }

  // 2) Record the anonymous ballot (no voter reference).
  try {
    await Vote.create({ election: election._id, candidate: candidate._id });
  } catch (error) {
    // Compensate so the voter is not left "already voted" with no ballot.
    await VoterRecord.deleteOne({ _id: voterRecord._id });
    throw error;
  }

  res.status(201).json({
    success: true,
    message: 'Your vote has been recorded',
    data: {},
  });
});

// GET /api/votes/results/:electionId  (public, gated on publish)
const getResults = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.electionId);
  if (!election) {
    return res.status(404).json({ success: false, message: 'Election not found' });
  }

  const status = computeStatus(election.startDate, election.endDate);
  const published = status === 'completed' || election.resultsPublished === true;

  if (!published) {
    return res
      .status(403)
      .json({ success: false, message: 'Results are not published yet' });
  }

  // Aggregate ballots per candidate (anonymous ballots only — no voter data).
  const results = await Vote.aggregate([
    { $match: { election: election._id } },
    { $group: { _id: '$candidate', votes: { $sum: 1 } } },
    {
      $lookup: {
        from: 'candidates',
        localField: '_id',
        foreignField: '_id',
        as: 'candidate',
      },
    },
    { $unwind: { path: '$candidate', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        candidateId: '$_id',
        fullName: { $ifNull: ['$candidate.fullName', 'Unknown candidate'] },
        party: { $ifNull: ['$candidate.party', null] },
        votes: 1,
      },
    },
    { $sort: { votes: -1 } },
  ]);

  const totalVotes = results.reduce((sum, row) => sum + row.votes, 0);

  const enriched = results.map((row) => ({
    ...row,
    percentage: totalVotes > 0 ? Number(((row.votes / totalVotes) * 100).toFixed(2)) : 0,
  }));

  res.status(200).json({
    success: true,
    message: 'Election results',
    data: {
      election: { _id: election._id, title: election.title, status, totalVotes },
      results: enriched,
    },
  });
});

module.exports = { castVote, getResults };

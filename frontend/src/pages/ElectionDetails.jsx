import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getElection } from '../services/electionService.js';
import { getCandidates } from '../services/candidateService.js';
import { useAuth } from '../context/AuthContext.jsx';
import CandidateCard from '../components/CandidateCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import { formatDateTime } from '../utils/format.js';

export default function ElectionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getElection(id), getCandidates(id)])
      .then(([eRes, cRes]) => {
        if (!mounted) return;
        setElection(eRes.data.data);
        setCandidates(cRes.data.data || []);
        setError('');
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || 'Could not load this election');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="spinner-page">
        <span className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="banner banner-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!election) return null;

  const isActive = election.status === 'active';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="page">
      <div className="container">
        <Link to="/elections" className="btn btn-ghost btn-sm mb-3">
          <Icon name="arrow-left" size={16} /> Back to elections
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">{election.title}</h1>
            <p className="page-subtitle">{election.description || 'No description provided.'}</p>
          </div>
          <StatusBadge status={election.status} />
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: 'var(--text-muted)' }}>
              <span>
                <Icon name="calendar" size={16} /> Starts: {formatDateTime(election.startDate)}
              </span>
              <span>
                <Icon name="clock" size={16} /> Ends: {formatDateTime(election.endDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="banner banner-info">
          {!user ? (
            <>
              You must{' '}
              <Link to="/login" state={{ from: `/elections/${id}/vote` }}>
                log in
              </Link>{' '}
              to vote in this election.
            </>
          ) : isAdmin ? (
            'Administrators cannot cast votes.'
          ) : isActive ? (
            'This election is active — you are eligible to vote.'
          ) : (
            `This election is ${election.status}; voting is not currently open.`
          )}
        </div>

        <div className="page-header">
          <h2 className="page-title">Candidates ({candidates.length})</h2>
          {isActive && !isAdmin && (
            <Link to={`/elections/${id}/vote`} className="btn btn-primary">
              <Icon name="vote" /> Vote now
            </Link>
          )}
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            icon="users"
            title="No candidates yet"
            message="Candidates for this election have not been added yet."
          />
        ) : (
          <div className="candidate-list">
            {candidates.map((c) => (
              <CandidateCard key={c._id} candidate={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

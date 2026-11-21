import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getElection } from '../services/electionService.js';
import { getCandidates } from '../services/candidateService.js';
import { castVote } from '../services/voteService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CandidateCard from '../components/CandidateCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';

export default function Vote() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { status: 'success' | 'error', message }

  useEffect(() => {
    let mounted = true;
    Promise.all([getElection(id), getCandidates(id)])
      .then(([eRes, cRes]) => {
        if (!mounted) return;
        setElection(eRes.data.data);
        setCandidates(cRes.data.data || []);
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

  const selected = candidates.find((c) => c._id === selectedId);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await castVote(id, selectedId);
      setResult({ status: 'success', message: 'Your vote has been recorded. Thank you for participating!' });
      addToast('Vote submitted successfully!', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Vote failed. Please try again.';
      setResult({ status: 'error', message });
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  };

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

  const isAdmin = user?.role === 'admin';

  if (result?.status === 'success') {
    return (
      <div className="page">
        <div className="container container-narrow">
          <div className="card">
            <div className="card-body panel-center">
              <div className="empty-icon empty-icon-success">
                <Icon name="check" />
              </div>
              <h2 style={{ marginTop: 16 }}>Vote recorded</h2>
              <p className="form-hint">{result.message}</p>
              <div className="flex-center mt-3">
                <Link to="/dashboard" className="btn btn-secondary">Go to dashboard</Link>
                <Link to="/results" className="btn btn-primary">View results</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (election.status !== 'active') {
    return (
      <div className="page">
        <div className="container container-narrow">
          <div className="card">
            <div className="card-body panel-center">
              <StatusBadge status={election.status} />
              <h2 style={{ marginTop: 16 }}>Voting is not open</h2>
              <p className="form-hint">
                This election is currently {election.status}. Voting is only allowed while an
                election is active.
              </p>
              <Link to={`/elections/${id}`} className="btn btn-secondary mt-2">
                Back to election
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="page">
        <div className="container container-narrow">
          <div className="card">
            <div className="card-body panel-center">
              <div className="empty-icon">
                <Icon name="shield" />
              </div>
              <h2 style={{ marginTop: 16 }}>Administrators cannot vote</h2>
              <p className="form-hint">
                Only registered voters can cast a ballot. Your account has the admin role.
              </p>
              <Link to={`/elections/${id}`} className="btn btn-secondary mt-2">
                Back to election
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container container-narrow">
        <Link to={`/elections/${id}`} className="btn btn-ghost btn-sm mb-3">
          <Icon name="arrow-left" size={16} /> Back to election
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">Cast your vote</h1>
            <p className="page-subtitle">{election.title}</p>
          </div>
          <StatusBadge status={election.status} />
        </div>

        {result?.status === 'error' && <div className="banner banner-error">{result.message}</div>}

        {confirming ? (
          <div className="confirm-panel">
            <h2 style={{ marginTop: 0 }}>Confirm your vote</h2>
            <p className="form-hint">You are about to vote for:</p>
            <div className="candidate-list" style={{ textAlign: 'left', marginBottom: 16 }}>
              {selected && <CandidateCard candidate={selected} />}
            </div>
            <p className="form-hint">
              This action is final and cannot be changed. You can only vote once per election.
            </p>
            <div className="flex-center flex-wrap">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Back
              </button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
                {submitting && <Spinner small />} Confirm vote
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="form-hint mb-3">
              Select one candidate below, then continue to confirm your choice.
            </p>
            <div className="candidate-list">
              {candidates.map((c) => (
                <CandidateCard
                  key={c._id}
                  candidate={c}
                  selectable
                  selected={selectedId === c._id}
                  onSelect={() => setSelectedId(c._id)}
                />
              ))}
            </div>
            <div className="mt-3">
              <button
                className="btn btn-primary btn-lg btn-block"
                disabled={!selectedId}
                onClick={() => setConfirming(true)}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

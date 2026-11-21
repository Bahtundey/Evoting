import { useEffect, useState } from 'react';
import { getElections } from '../../services/electionService.js';
import { getResults } from '../../services/voteService.js';
import ResultsPanel from '../../components/ResultsPanel.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function VotingResults() {
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getElections()
      .then(({ data }) => setElections(data.data || []))
      .catch(() => setElections([]))
      .finally(() => setLoadingList(false));
  }, []);

  const loadResults = async (id) => {
    setSelectedId(id);
    setData(null);
    setError('');
    setLoadingResults(true);
    try {
      const res = await getResults(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load results');
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Voting results</h2>
          <p className="page-subtitle">Published results per election.</p>
        </div>
      </div>

      {loadingList ? (
        <div className="spinner-page">
          <span className="spinner" />
        </div>
      ) : elections.length === 0 ? (
        <EmptyState icon="bar-chart" title="No elections yet" message="Create an election to see results." />
      ) : (
        <>
          <div className="toolbar">
            <div style={{ minWidth: 280 }}>
              <select
                className="form-select"
                value={selectedId}
                onChange={(e) => e.target.value && loadResults(e.target.value)}
              >
                <option value="">Select an election…</option>
                {elections.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title} ({e.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedId && !loadingResults && (
            <p className="form-hint">Choose an election above to view its results.</p>
          )}

          {loadingResults && (
            <div className="spinner-page">
              <span className="spinner" />
            </div>
          )}

          {error && <div className="banner banner-error">{error}</div>}

          {data && (
            <div className="card mt-3">
              <div className="card-body">
                <ResultsPanel data={data} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

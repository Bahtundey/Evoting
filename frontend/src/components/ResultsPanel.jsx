import StatusBadge from './StatusBadge.jsx';
import EmptyState from './EmptyState.jsx';

// Renders aggregated election results (bar chart + table). Reused by the
// public Results page and the admin VotingResults page.
export default function ResultsPanel({ data }) {
  const election = data?.election;
  const rows = data?.results || [];
  const total = election?.totalVotes ?? 0;

  if (!rows.length) {
    return (
      <EmptyState
        icon="bar-chart"
        title="No votes recorded"
        message="No ballots have been cast in this election yet."
      />
    );
  }

  const leadingId = rows[0]?.candidateId;

  return (
    <div>
      <div className="results-header">
        <div>
          <h2 style={{ margin: 0 }}>{election?.title}</h2>
          <div className="results-meta">
            <StatusBadge status={election?.status} />
            <span className="badge badge-neutral">{total} total votes</span>
          </div>
        </div>
      </div>

      <div className="bar-chart">
        {rows.map((r) => (
          <div className="bar-row" key={r.candidateId}>
            <div className="bar-head">
              <span className="bar-name">
                {r.fullName}
                {r.candidateId === leadingId && total > 0 && (
                  <span className="badge badge-success" style={{ marginLeft: 8 }}>
                    Leading
                  </span>
                )}
              </span>
              <span className="bar-votes">
                {r.votes} votes · {r.percentage}%
              </span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${r.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrap mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Party</th>
              <th>Votes</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.candidateId}>
                <td>{r.fullName}</td>
                <td>{r.party || '—'}</td>
                <td>{r.votes}</td>
                <td>{r.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

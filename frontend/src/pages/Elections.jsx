import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getElections } from '../services/electionService.js';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import { formatDate } from '../utils/format.js';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getElections()
      .then(({ data }) => setElections(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load elections'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return elections.filter((e) => {
      const matchesFilter = filter === 'all' || e.status === filter;
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [elections, filter, search]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Elections</h1>
            <p className="page-subtitle">Browse open, upcoming and past elections.</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-search">
            <Icon name="search" />
            <input
              className="form-input"
              type="text"
              placeholder="Search elections…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-pill ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="spinner-page">
            <span className="spinner" />
          </div>
        ) : error ? (
          <div className="banner banner-error">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="election"
            title="No elections found"
            message={
              search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'There are no elections yet.'
            }
          />
        ) : (
          <div className="election-grid">
            {filtered.map((e) => (
              <div className="election-card" key={e._id}>
                <div>
                  <StatusBadge status={e.status} />
                </div>
                <h3>{e.title}</h3>
                {e.description && <p className="election-desc">{e.description}</p>}
                <div className="election-meta">
                  <span>
                    <Icon name="calendar" size={14} /> Starts {formatDate(e.startDate)}
                  </span>
                  <span>
                    <Icon name="clock" size={14} /> Ends {formatDate(e.endDate)}
                  </span>
                </div>
                <div className="election-footer">
                  <Link to={`/elections/${e._id}`} className="btn btn-outline btn-sm">
                    View details
                  </Link>
                  {e.status === 'active' && (
                    <Link to={`/elections/${e._id}/vote`} className="btn btn-primary btn-sm">
                      Vote now
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

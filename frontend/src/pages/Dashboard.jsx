import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getElections } from '../services/electionService.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { firstName, formatDate } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getElections()
      .then(({ data }) => setElections(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load elections'))
      .finally(() => setLoading(false));
  }, []);

  const active = elections.filter((e) => e.status === 'active');
  const upcoming = elections.filter((e) => e.status === 'upcoming');
  const completed = elections.filter((e) => e.status === 'completed');

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {firstName(user?.fullName)}</h1>
            <p className="page-subtitle">Here&apos;s what&apos;s happening on the platform.</p>
          </div>
          <div className="page-actions">
            <Link to="/elections" className="btn btn-primary">Browse elections</Link>
          </div>
        </div>

        {error && <div className="banner banner-error">{error}</div>}

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total elections</div>
            <div className="stat-value">{elections.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active</div>
            <div className="stat-value">{active.length}</div>
            <div className="stat-sub">Open for voting</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upcoming</div>
            <div className="stat-value">{upcoming.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completed.length}</div>
          </div>
        </div>

        <div className="dashboard-grid mt-3">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent elections</h2>
              <Link to="/elections" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="spinner-page">
                  <span className="spinner" />
                </div>
              ) : elections.length === 0 ? (
                <p className="form-hint" style={{ margin: 0 }}>No elections yet.</p>
              ) : (
                <div className="activity-list">
                  {elections.slice(0, 5).map((e) => (
                    <div className="activity-item" key={e._id}>
                      <div>
                        <div className="activity-item-title">{e.title}</div>
                        <div className="activity-item-meta">
                          {formatDate(e.startDate)} → {formatDate(e.endDate)}
                        </div>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your voting status</h2>
            </div>
            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-item-title">Account</span>
                  {user?.isActive ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-danger">Deactivated</span>
                  )}
                </div>
                <div className="activity-item">
                  <span className="activity-item-title">Role</span>
                  <span className="badge badge-voter">Voter</span>
                </div>
                <div className="activity-item">
                  <span className="activity-item-title">Open elections</span>
                  <span className="badge badge-neutral">{active.length}</span>
                </div>
              </div>
              <div className="mt-3">
                {active.length > 0 ? (
                  <Link to="/elections" className="btn btn-primary btn-block">
                    Vote in an active election
                  </Link>
                ) : (
                  <p className="form-hint">No elections are open for voting right now.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

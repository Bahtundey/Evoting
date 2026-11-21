import { useEffect, useState } from 'react';
import { getUsers } from '../../services/userService.js';
import { getElections } from '../../services/electionService.js';
import { getCandidates } from '../../services/candidateService.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: [], elections: [], candidates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getUsers(), getElections(), getCandidates()])
      .then(([u, e, c]) =>
        setStats({
          users: u.data.data || [],
          elections: e.data.data || [],
          candidates: c.data.data || [],
        })
      )
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const { users, elections, candidates } = stats;
  const active = elections.filter((e) => e.status === 'active');
  const completed = elections.filter((e) => e.status === 'completed');

  if (loading) {
    return (
      <div className="spinner-page">
        <span className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="banner banner-error">{error}</div>;
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Registered voters</div>
          <div className="stat-value">{users.filter((u) => u.role === 'voter').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total elections</div>
          <div className="stat-value">{elections.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active elections</div>
          <div className="stat-value">{active.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed elections</div>
          <div className="stat-value">{completed.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total candidates</div>
          <div className="stat-value">{candidates.length}</div>
        </div>
      </div>

      <div className="dashboard-grid mt-3">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent elections</h2>
          </div>
          <div className="card-body">
            {elections.length === 0 ? (
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
            <h2 className="card-title">Recent registrations</h2>
          </div>
          <div className="card-body">
            {users.length === 0 ? (
              <p className="form-hint" style={{ margin: 0 }}>No users yet.</p>
            ) : (
              <div className="activity-list">
                {users.slice(0, 5).map((u) => (
                  <div className="activity-item" key={u._id}>
                    <div>
                      <div className="activity-item-title">{u.fullName}</div>
                      <div className="activity-item-meta">{u.email}</div>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-voter'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

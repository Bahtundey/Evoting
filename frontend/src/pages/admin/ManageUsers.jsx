import { useEffect, useMemo, useState } from 'react';
import { getUsers, updateUserStatus } from '../../services/userService.js';
import { useToast } from '../../context/ToastContext.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Icon from '../../components/Icon.jsx';
import { formatDate } from '../../utils/format.js';

export default function ManageUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toggling, setToggling] = useState(null); // { user, action: 'activate' | 'deactivate' }
  const [toggleLoading, setToggleLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getUsers()
      .then(({ data }) => setUsers(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.registrationNumber || '').toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const confirmToggle = async () => {
    setToggleLoading(true);
    try {
      await updateUserStatus(toggling.user._id, toggling.action === 'activate');
      addToast(
        `User ${toggling.action === 'activate' ? 'activated' : 'deactivated'}`,
        'success'
      );
      setToggling(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Voters</h2>
          <p className="page-subtitle">Search, filter and manage registered accounts.</p>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div className="toolbar">
        <div className="toolbar-search">
          <Icon name="search" />
          <input
            className="form-input"
            type="text"
            placeholder="Search by name, email or registration number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="voter">Voters</option>
            <option value="admin">Admins</option>
          </select>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-page">
          <span className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="user" title="No users found" message="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registration #</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.fullName}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.registrationNumber}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-voter'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      {u.isActive ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setToggling({ user: u, action: 'deactivate' })}
                          title="Deactivate"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setToggling({ user: u, action: 'activate' })}
                          title="Activate"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toggling && (
        <ConfirmDialog
          title={toggling.action === 'activate' ? 'Activate account' : 'Deactivate account'}
          message={`Are you sure you want to ${toggling.action} "${toggling.user.fullName}" (${toggling.user.email})?`}
          confirmLabel={toggling.action === 'activate' ? 'Activate' : 'Deactivate'}
          danger={toggling.action === 'deactivate'}
          loading={toggleLoading}
          onConfirm={confirmToggle}
          onCancel={() => setToggling(null)}
        />
      )}
    </div>
  );
}

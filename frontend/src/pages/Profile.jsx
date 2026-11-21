import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { updateUser } from '../services/userService.js';
import Spinner from '../components/Spinner.jsx';
import { initials, formatDate } from '../utils/format.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || '', email: user.email || '', newPassword: '' });
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (form.newPassword && form.newPassword.length < 6) {
      e.newPassword = 'New password must be at least 6 characters';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const payload = { fullName: form.fullName.trim(), email: form.email.trim() };
      if (form.newPassword) payload.password = form.newPassword;
      await updateUser(user._id, payload);
      await refreshUser();
      addToast('Profile updated successfully!', 'success');
      setForm((f) => ({ ...f, newPassword: '' }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My profile</h1>
            <p className="page-subtitle">View and update your account information.</p>
          </div>
        </div>

        <div className="profile-layout">
          <div className="card">
            <div className="card-body">
              <div className="candidate-avatar" style={{ width: 88, height: 88, fontSize: '2rem' }}>
                {initials(user?.fullName)}
              </div>
              <h2 style={{ marginTop: 16 }}>{user?.fullName}</h2>
              <div className="results-meta">
                <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-voter'}`}>
                  {user?.role}
                </span>
                {user?.isActive ? (
                  <span className="badge badge-success">Active</span>
                ) : (
                  <span className="badge badge-danger">Deactivated</span>
                )}
              </div>
              <div className="activity-list mt-3">
                <div className="activity-item">
                  <span className="activity-item-title">Registration number</span>
                  <span className="activity-item-meta">{user?.registrationNumber}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-item-title">Member since</span>
                  <span className="activity-item-meta">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Update profile</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    className={`form-input ${errors.fullName ? 'invalid' : ''}`}
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                  />
                  {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${errors.email ? 'invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">New password (optional)</label>
                  <input
                    id="newPassword"
                    type="password"
                    className={`form-input ${errors.newPassword ? 'invalid' : ''}`}
                    value={form.newPassword}
                    onChange={handleChange('newPassword')}
                    autoComplete="new-password"
                  />
                  {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
                </div>

                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving && <Spinner small />} Save changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

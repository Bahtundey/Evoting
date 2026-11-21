import { useEffect, useState } from 'react';
import {
  getElections,
  createElection,
  updateElection,
  deleteElection,
} from '../../services/electionService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Icon from '../../components/Icon.jsx';
import { formatDate, toDatetimeLocal } from '../../utils/format.js';

const EMPTY = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  status: '',
  resultsPublished: false,
};

export default function ManageElections() {
  const { addToast } = useToast();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', election? }
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getElections()
      .then(({ data }) => setElections(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load elections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm({
      ...EMPTY,
      startDate: toDatetimeLocal(),
      endDate: toDatetimeLocal(Date.now() + 86400000),
    });
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (election) => {
    setForm({
      title: election.title,
      description: election.description || '',
      startDate: toDatetimeLocal(election.startDate),
      endDate: toDatetimeLocal(election.endDate),
      status: election.statusManuallySet ? election.status : '',
      resultsPublished: election.resultsPublished,
    });
    setFormError('');
    setModal({ mode: 'edit', election });
  };

  const closeModal = () => {
    if (!submitting) setModal(null);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setFormError('Start and end dates are required');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError('End date must be after start date');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      resultsPublished: form.resultsPublished,
    };
    if (form.status) payload.status = form.status;

    setSubmitting(true);
    try {
      if (modal.mode === 'create') {
        await createElection(payload);
        addToast('Election created', 'success');
      } else {
        await updateElection(modal.election._id, payload);
        addToast('Election updated', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      const message = err.response?.data?.message || 'Save failed';
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteElection(deleting._id);
      addToast('Election deleted', 'success');
      setDeleting(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Elections</h2>
          <p className="page-subtitle">Create, edit, publish and close elections.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={16} /> New election
          </button>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="spinner-page">
          <span className="spinner" />
        </div>
      ) : elections.length === 0 ? (
        <EmptyState
          icon="election"
          title="No elections yet"
          message="Create your first election to get started."
          action={
            <button className="btn btn-primary" onClick={openCreate}>
              <Icon name="plus" size={16} /> New election
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Period</th>
                <th>Status</th>
                <th>Results</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {elections.map((e) => (
                <tr key={e._id}>
                  <td>
                    <strong>{e.title}</strong>
                  </td>
                  <td>
                    {formatDate(e.startDate)} → {formatDate(e.endDate)}
                  </td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>
                    {e.resultsPublished ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge badge-outline">Hidden</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)} title="Edit">
                        <Icon name="edit" size={16} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleting(e)} title="Delete">
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Create election' : 'Edit election'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} noValidate>
            {formError && <div className="banner banner-error">{formError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="el-title">Title</label>
              <input
                id="el-title"
                className="form-input"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="e.g. Student Council 2026"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="el-desc">Description</label>
              <textarea
                id="el-desc"
                className="form-textarea"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Optional description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="el-start">Start date</label>
                <input
                  id="el-start"
                  type="datetime-local"
                  className="form-input"
                  value={form.startDate}
                  onChange={handleChange('startDate')}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="el-end">End date</label>
                <input
                  id="el-end"
                  type="datetime-local"
                  className="form-input"
                  value={form.endDate}
                  onChange={handleChange('endDate')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="el-status">Status</label>
                <select
                  id="el-status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange('status')}
                >
                  <option value="">Auto (from dates)</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Publish results</label>
                <label className="form-hint" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.resultsPublished}
                    onChange={handleChange('resultsPublished')}
                  />
                  Allow public results now
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting && <Spinner small />} Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete election"
          message={`Delete "${deleting.title}"? Elections with recorded votes cannot be deleted.`}
          confirmLabel="Delete"
          danger
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

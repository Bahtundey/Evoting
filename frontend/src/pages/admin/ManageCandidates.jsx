import { useEffect, useState } from 'react';
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from '../../services/candidateService.js';
import { getElections } from '../../services/electionService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Icon from '../../components/Icon.jsx';
import { initials } from '../../utils/format.js';

const EMPTY = { fullName: '', party: '', biography: '', photo: '', election: '' };

export default function ManageCandidates() {
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getCandidates(), getElections()])
      .then(([cRes, eRes]) => {
        setCandidates(cRes.data.data || []);
        setElections(eRes.data.data || []);
      })
      .catch((err) => addToast(err.response?.data?.message || 'Could not load data', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (candidate) => {
    setForm({
      fullName: candidate.fullName,
      party: candidate.party || '',
      biography: candidate.biography || '',
      photo: candidate.photo || '',
      election: candidate.election?._id || candidate.election || '',
    });
    setFormError('');
    setModal({ mode: 'edit', candidate });
  };

  const closeModal = () => {
    if (!submitting) setModal(null);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (!form.party.trim()) {
      setFormError('Party is required');
      return;
    }
    if (!form.election) {
      setFormError('Please assign the candidate to an election');
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      party: form.party.trim(),
      biography: form.biography,
      photo: form.photo,
      election: form.election,
    };

    setSubmitting(true);
    try {
      if (modal.mode === 'create') {
        await createCandidate(payload);
        addToast('Candidate added', 'success');
      } else {
        await updateCandidate(modal.candidate._id, payload);
        addToast('Candidate updated', 'success');
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
      await deleteCandidate(deleting._id);
      addToast('Candidate removed', 'success');
      setDeleting(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const electionTitle = (candidate) => candidate.election?.title || '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Candidates</h2>
          <p className="page-subtitle">Add, edit and assign candidates to elections.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={16} /> Add candidate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-page">
          <span className="spinner" />
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon="users"
          title="No candidates yet"
          message="Add your first candidate to an election."
          action={
            <button className="btn btn-primary" onClick={openCreate}>
              <Icon name="plus" size={16} /> Add candidate
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Party</th>
                <th>Election</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {c.photo ? (
                        <img
                          className="candidate-photo"
                          style={{ width: 40, height: 40 }}
                          src={c.photo}
                          alt={c.fullName}
                        />
                      ) : (
                        <div className="candidate-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                          {initials(c.fullName)}
                        </div>
                      )}
                      <strong>{c.fullName}</strong>
                    </div>
                  </td>
                  <td>{c.party}</td>
                  <td>{electionTitle(c)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} title="Edit">
                        <Icon name="edit" size={16} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleting(c)} title="Delete">
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
          title={modal.mode === 'create' ? 'Add candidate' : 'Edit candidate'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} noValidate>
            {formError && <div className="banner banner-error">{formError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="c-name">Full name</label>
              <input
                id="c-name"
                className="form-input"
                value={form.fullName}
                onChange={handleChange('fullName')}
                placeholder="e.g. Ada Lovelace"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="c-party">Party</label>
              <input
                id="c-party"
                className="form-input"
                value={form.party}
                onChange={handleChange('party')}
                placeholder="e.g. Innovation Party"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="c-election">Election</label>
              <select
                id="c-election"
                className="form-select"
                value={form.election}
                onChange={handleChange('election')}
              >
                <option value="">Select an election…</option>
                {elections.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="c-bio">Biography</label>
              <textarea
                id="c-bio"
                className="form-textarea"
                value={form.biography}
                onChange={handleChange('biography')}
                placeholder="Short biography"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="c-photo">Photo URL</label>
              <input
                id="c-photo"
                className="form-input"
                value={form.photo}
                onChange={handleChange('photo')}
                placeholder="https://example.com/photo.jpg"
              />
              <div className="form-hint">Enter an image URL. Leave blank to use initials.</div>
              {form.photo && (
                <img
                  src={form.photo}
                  alt="Preview"
                  className="candidate-photo"
                  style={{ marginTop: 12, width: 64, height: 64 }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
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
          title="Remove candidate"
          message={`Remove "${deleting.fullName}"? Candidates with recorded votes cannot be removed.`}
          confirmLabel="Remove"
          danger
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

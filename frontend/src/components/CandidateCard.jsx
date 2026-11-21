import { initials } from '../utils/format.js';

/**
 * Candidate display card. Optionally selectable (radio-card style) for the
 * voting page, in which case onSelect is called with the candidate id.
 */
export default function CandidateCard({ candidate, selectable = false, selected = false, onSelect }) {
  const classes = ['candidate-card'];
  if (selectable) classes.push('candidate-select');
  if (selected) classes.push('selected');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  };

  const body = (
    <>
      {candidate.photo ? (
        <img className="candidate-photo" src={candidate.photo} alt={candidate.fullName} />
      ) : (
        <div className="candidate-avatar">{initials(candidate.fullName)}</div>
      )}
      <div className="candidate-info">
        <h3 className="candidate-name">{candidate.fullName}</h3>
        <div className="candidate-party">{candidate.party}</div>
        {candidate.biography && <p className="candidate-bio">{candidate.biography}</p>}
      </div>
    </>
  );

  if (selectable) {
    return (
      <div
        className={classes.join(' ')}
        onClick={onSelect}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <input
          type="radio"
          className="candidate-radio"
          checked={selected}
          onChange={() => {}}
          readOnly
          tabIndex={-1}
        />
        {body}
      </div>
    );
  }

  return <div className={classes.join(' ')}>{body}</div>;
}

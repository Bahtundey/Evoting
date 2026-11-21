export default function Spinner({ small = false }) {
  return (
    <span
      className={`spinner ${small ? 'spinner-sm' : ''}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="spinner-page">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

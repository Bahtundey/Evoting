const STATUS_MAP = {
  upcoming: { label: 'Upcoming', className: 'badge-upcoming' },
  active: { label: 'Active', className: 'badge-active' },
  completed: { label: 'Completed', className: 'badge-completed' },
};

// Colored badge for an election status.
export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status || 'Unknown', className: 'badge-neutral' };
  return <span className={`badge ${s.className}`}>{s.label}</span>;
}

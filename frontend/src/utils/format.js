// Shared formatting helpers.

// "2026-11-21T19:09:35.523Z" -> "Nov 21, 2026"
export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// -> "Nov 21, 2026, 7:09 PM"
export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// First letters of up to two words, e.g. "Ada Lovelace" -> "AL".
export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

// A short one-word greeting name, e.g. "Ada Lovelace" -> "Ada".
export function firstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || '';
}

// Convert a Date (or ISO string) to the value expected by <input type="datetime-local">.
export function toDatetimeLocal(value) {
  const d = value ? new Date(value) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

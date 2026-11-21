import Icon from './Icon.jsx';

export default function EmptyState({ icon = 'inbox', title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

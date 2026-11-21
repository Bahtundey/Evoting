import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container">
        <EmptyState
          icon="alert-circle"
          title="404 — Page not found"
          message="The page you're looking for doesn't exist or has moved."
          action={
            <Link to="/" className="btn btn-primary">
              Go back home
            </Link>
          }
        />
      </div>
    </div>
  );
}

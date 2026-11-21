import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../../components/Icon.jsx';
import config from '../../config.js';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/elections', label: 'Elections', icon: 'election' },
  { to: '/admin/candidates', label: 'Candidates', icon: 'users' },
  { to: '/admin/users', label: 'Voters', icon: 'user' },
  { to: '/admin/results', label: 'Results', icon: 'bar-chart' },
];

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/elections': 'Manage Elections',
  '/admin/candidates': 'Manage Candidates',
  '/admin/users': 'Manage Voters',
  '/admin/results': 'Voting Results',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const title = TITLES[location.pathname] || 'Admin';

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar ${open ? 'open' : ''}`}>
        <Link to="/admin/dashboard" className="admin-brand" onClick={close}>
          <span className="brand-mark">
            <Icon name="vote" />
          </span>
          {config.brandName} Admin
        </Link>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
              onClick={close}
            >
              <Icon name={item.icon} /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-nav-footer">
          <Link to="/" className="admin-nav-link" onClick={close}>
            <Icon name="home" /> Back to site
          </Link>
          <button className="admin-nav-button" onClick={handleLogout}>
            <Icon name="logout" /> Logout
          </button>
        </div>
      </div>

      <div className={`admin-sidebar-backdrop ${open ? 'show' : ''}`} onClick={close} />

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-toggle"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              <Icon name="menu" />
            </button>
            <h1>{title}</h1>
          </div>
          <div className="admin-topbar-right">
            <span className="badge badge-admin">{user?.role}</span>
            <span className="admin-user">{user?.fullName}</span>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

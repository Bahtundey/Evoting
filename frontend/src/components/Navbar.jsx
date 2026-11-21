import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';
import config from '../config.js';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={close}>
          <span className="brand-mark">
            <Icon name="vote" />
          </span>
          {config.brandName}
        </Link>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end className={linkClass} onClick={close}>
            Home
          </NavLink>
          <NavLink to="/elections" className={linkClass} onClick={close}>
            Elections
          </NavLink>
          <NavLink to="/results" className={linkClass} onClick={close}>
            Results
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={linkClass} onClick={close}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={linkClass} onClick={close}>
              Admin
            </NavLink>
          )}

          <div className="navbar-auth">
            {user ? (
              <>
                <NavLink to="/profile" className={linkClass} onClick={close}>
                  <Icon name="user" size={18} /> {user.fullName?.split(' ')[0]}
                </NavLink>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  <Icon name="logout" size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="app-navbar">
      <NavLink to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: '700' }}>
        Preppilot
      </NavLink>

      <div className="app-nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/preparation">Preparation</NavLink>
            <NavLink to="/practice">Practice</NavLink>
            <NavLink to="/results">Results</NavLink>
            <NavLink to="/progress">Progress</NavLink>
            <NavLink to="/notes">Notes</NavLink>
            <NavLink to="/ai-assistant">AI Assistant</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <span>{user?.name || 'User'}</span>
            <button type="button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

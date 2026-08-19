import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <NavLink to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: '700' }}>
        Preppilot
      </NavLink>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/practice">Practice</NavLink>
            <NavLink to="/progress">Progress</NavLink>
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

import { createContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('preppilot_token') || '');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem('preppilot_token');
      return;
    }

    localStorage.setItem('preppilot_token', token);

    fetchCurrentUser()
      .then(({ data }) => setUser(data))
      .catch(() => {
        setToken('');
        setUser(null);
        localStorage.removeItem('preppilot_token');
      });
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData || null);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('preppilot_token');
  };

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

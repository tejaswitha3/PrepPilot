import { createContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('preppilot_token') || '');
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    const clearInvalidToken = () => {
      setToken('');
      setUser(null);
      localStorage.removeItem('preppilot_token');
      setIsInitializing(false);
    };
    window.addEventListener('preppilot:invalid-token', clearInvalidToken);

    if (!token) {
      setUser(null);
      localStorage.removeItem('preppilot_token');
      setIsInitializing(false);
      return () => window.removeEventListener('preppilot:invalid-token', clearInvalidToken);
    }

    localStorage.setItem('preppilot_token', token);

    fetchCurrentUser()
      .then(({ data }) => {
        if (active) setUser(data);
      })
      .catch((error) => {
        if (!active) return;
        setUser(null);
        if ([401, 422].includes(error.response?.status)) {
          setToken('');
          localStorage.removeItem('preppilot_token');
        }
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
      window.removeEventListener('preppilot:invalid-token', clearInvalidToken);
    };
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
    () => ({ token, user, login, logout, isInitializing, isAuthenticated: Boolean(token) }),
    [token, user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

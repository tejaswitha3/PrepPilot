import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../api/authApi', () => ({
  fetchCurrentUser: vi.fn(),
}));

import { fetchCurrentUser } from '../../api/authApi';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';

function SessionStatus() {
  const { isAuthenticated, isInitializing, user } = useAuth();
  if (isInitializing) return <p>Checking session</p>;
  return <p>{isAuthenticated ? `Signed in as ${user?.name || 'user'}` : 'Signed out'}</p>;
}

test('restores a valid session after page refresh', async () => {
  window.localStorage.setItem('preppilot_token', 'valid-token');
  fetchCurrentUser.mockResolvedValueOnce({ data: { id: 1, name: 'Rae' } });
  render(<AuthProvider><SessionStatus /></AuthProvider>);
  expect(await screen.findByText('Signed in as Rae')).toBeInTheDocument();
});

test('clears an expired session and signs the user out', async () => {
  window.localStorage.setItem('preppilot_token', 'expired-token');
  fetchCurrentUser.mockRejectedValueOnce({ response: { status: 401 } });
  render(<AuthProvider><SessionStatus /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('Signed out')).toBeInTheDocument());
  expect(window.localStorage.getItem('preppilot_token')).toBeNull();
});

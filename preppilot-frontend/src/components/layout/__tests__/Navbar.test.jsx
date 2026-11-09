import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { name: 'Student' }, logout: vi.fn() }),
}));

import Navbar from '../Navbar';

test('shows navigation links for preparation and results', () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: 'Preparation' })).toHaveAttribute('href', '/preparation');
  expect(screen.getByRole('link', { name: 'Results' })).toHaveAttribute('href', '/results');
});

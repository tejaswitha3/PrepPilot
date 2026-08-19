import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../api/questionApi', () => ({
  fetchPreparation: vi.fn(() => Promise.resolve({ data: { categories: [{ id: 'dsa', name: 'DSA / Coding', topics: [] }] } })),
}));

import PreparationPage from '../PreparationPage';

test('renders Preparation page and categories', async () => {
  render(<PreparationPage />);
  expect(screen.getByText('Preparation')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText('DSA / Coding')).toBeInTheDocument());
});

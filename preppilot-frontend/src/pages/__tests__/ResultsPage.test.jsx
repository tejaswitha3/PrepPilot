import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../api/questionApi', () => ({
  fetchAttempts: vi.fn(() => Promise.resolve({ data: [{ id: 1, question_text: 'Q1', category: 'DSA', topic: 'arrays', selected_answer: 'A', is_correct: true, created_at: new Date().toISOString() }] })),
}));

import ResultsPage from '../ResultsPage';

test('renders Results page and counts attempts', async () => {
  render(<ResultsPage />);
  expect(screen.getByText('Results')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText('Total attempts')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../../api/questionApi', () => ({
  fetchPreparation: vi.fn(() => Promise.resolve({
    data: {
      categories: [{
        id: 'dsa',
        name: 'DSA / Coding',
        question_category: 'DSA',
        topics: [{ id: 'arrays', name: 'Arrays', intro: 'Array introduction.' }],
      }],
    },
  })),
}));

import PreparationPage from '../PreparationPage';

test('renders Preparation page and categories', async () => {
  render(
    <MemoryRouter>
      <PreparationPage />
    </MemoryRouter>
  );
  expect(await screen.findByText('Preparation')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('DSA / Coding')).toBeInTheDocument());
});

test('starts practice with the selected topic and its stored question category', async () => {
  render(
    <MemoryRouter>
      <PreparationPage />
    </MemoryRouter>
  );

  fireEvent.click(await screen.findByRole('option', { name: 'DSA / Coding' }));
  fireEvent.click(screen.getByRole('option', { name: 'Arrays' }));

  expect(screen.getByRole('link', { name: 'Start practice for Arrays' }))
    .toHaveAttribute('href', '/practice?category=DSA&topic=Arrays');
});

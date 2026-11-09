import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../api/questionApi', () => ({
  fetchAttempts: vi.fn(() => Promise.resolve({
    data: [
      {
        id: 1,
        question_text: 'Q1',
        category: 'DSA',
        topic: 'Arrays',
        selected_answer: 'A',
        correct_answer: 'B',
        explanation: 'B is correct because of the stated rule.',
        is_correct: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        question_text: 'Legacy question',
        category: 'DSA',
        topic: 'Trees',
        selected_answer: 'C',
        correct_answer: 'C',
        explanation: null,
        is_correct: true,
        created_at: new Date().toISOString(),
      },
    ],
  })),
}));

import ResultsPage, { serializeAttemptsCsv } from '../ResultsPage';

test('renders Results page and counts attempts', async () => {
  render(<ResultsPage />);
  expect(screen.getByText('Results')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText('Total attempts')).toBeInTheDocument());
  await waitFor(() => {
    expect(screen.getByText('Total attempts').parentElement.querySelector('strong')).toHaveTextContent('2');
    expect(screen.getAllByText('Correct')[0].parentElement.querySelector('strong')).toHaveTextContent('1');
  });
});

test('shows selected and correct answers and toggles explanations accessibly', async () => {
  render(<ResultsPage />);

  expect(await screen.findByText('Q1')).toBeInTheDocument();
  expect(screen.getByText('Your answer: A')).toBeInTheDocument();
  expect(screen.getByText('Correct answer: B')).toBeInTheDocument();

  const showButton = screen.getByRole('button', { name: 'Show explanation' });
  expect(showButton).toHaveAttribute('aria-expanded', 'false');
  expect(showButton).toHaveAttribute('aria-controls', 'attempt-explanation-1');
  expect(screen.getByText('B is correct because of the stated rule.')).not.toBeVisible();

  fireEvent.click(showButton);
  expect(screen.getByRole('button', { name: 'Hide explanation' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('B is correct because of the stated rule.')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Hide explanation' }));
  expect(screen.getByText('B is correct because of the stated rule.')).not.toBeVisible();
});

test('handles attempts without an explanation', async () => {
  render(<ResultsPage />);

  expect(await screen.findByText('Legacy question')).toBeInTheDocument();
  expect(screen.getByText('Correct answer: C')).toBeInTheDocument();
  expect(screen.getByText('Explanation is not available for this question.')).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Show explanation' })).toHaveLength(1);
});

test('category and topic filters limit the displayed attempt reviews', async () => {
  render(<ResultsPage />);

  await screen.findByText('Legacy question');
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'DSA' } });
  fireEvent.change(screen.getByLabelText('Topic'), { target: { value: 'Arrays' } });

  expect(screen.getByText('Q1')).toBeInTheDocument();
  expect(screen.queryByText('Legacy question')).not.toBeInTheDocument();
});

test('CSV export quotes every cell and escapes embedded quotes and line breaks', () => {
  const csv = serializeAttemptsCsv([{
    id: 7,
    question_text: 'Question, "quoted"\ncontinued',
    category: 'DSA',
    topic: 'Arrays',
    selected_answer: 'A',
    correct_answer: 'B',
    explanation: 'First line\nSecond line',
    is_correct: false,
    created_at: '2026-06-15T12:00:00',
  }]);

  expect(csv).toBe([
    '"id","question_text","category","topic","selected_answer","correct_answer","explanation","is_correct","created_at"',
    '"7","Question, ""quoted""\ncontinued","DSA","Arrays","A","B","First line\nSecond line","false","2026-06-15T12:00:00"',
  ].join('\r\n'));
});

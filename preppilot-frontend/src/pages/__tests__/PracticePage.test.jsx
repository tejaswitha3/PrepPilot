import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../../api/questionApi', () => ({
  fetchQuestions: vi.fn(),
  submitAttempt: vi.fn(),
}));

import { fetchQuestions, submitAttempt } from '../../api/questionApi';
import PracticePage from '../PracticePage';

function renderPractice(path = '/practice') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/practice" element={<PracticePage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

test('loads questions for the selected category and topic', async () => {
  fetchQuestions.mockResolvedValueOnce({
    data: [{
      id: 1,
      category: 'DSA',
      topic: 'Arrays',
      question_text: 'Which algorithm finds a maximum subarray sum?',
      options: ["Kadane's algorithm", 'Binary search'],
    }],
  });

  renderPractice('/practice?category=DSA&topic=Arrays');

  expect(await screen.findByText('Which algorithm finds a maximum subarray sum?')).toBeInTheDocument();
  expect(fetchQuestions).toHaveBeenCalledWith({ category: 'DSA', topic: 'Arrays' });
});

test('shows a helpful message when the selected topic has no questions', async () => {
  fetchQuestions.mockResolvedValueOnce({ data: [] });

  renderPractice('/practice?category=DSA&topic=Linked%20Lists');

  expect(await screen.findByText(/No questions are available for Linked Lists yet/)).toBeInTheDocument();
  expect(screen.queryByText('No practice questions available right now.')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Choose another topic' })).toHaveAttribute('href', '/preparation');
  expect(screen.getByRole('link', { name: 'practice all questions' })).toHaveAttribute('href', '/practice');
});

test('keeps unfiltered practice available', async () => {
  fetchQuestions.mockResolvedValueOnce({
    data: [{
      id: 1,
      category: 'DSA',
      topic: 'Arrays',
      question_text: 'A general practice question',
      options: ['A', 'B'],
    }],
  });

  renderPractice();

  await waitFor(() => expect(fetchQuestions).toHaveBeenCalledWith({}));
  expect(await screen.findByText('A general practice question')).toBeInTheDocument();
});

test('allows retrying answer submission after a network error', async () => {
  fetchQuestions.mockResolvedValueOnce({
    data: [{
      id: 8,
      category: 'DSA',
      topic: 'Arrays',
      question_text: 'Choose the answer',
      options: ['A', 'B'],
    }],
  });
  submitAttempt
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: { is_correct: true, correct_answer: 'A', explanation: 'A is right.' } });

  renderPractice();
  await screen.findByText('Choose the answer');
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('issue submitting your answer');
  fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
  expect(await screen.findByText('Correct answer!')).toBeInTheDocument();
  expect(submitAttempt).toHaveBeenCalledTimes(2);
});

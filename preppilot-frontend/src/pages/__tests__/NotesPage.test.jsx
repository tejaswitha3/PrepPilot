import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../api/notesApi', () => ({
  fetchNotes: vi.fn(() => Promise.resolve({ data: [] })),
  createNote: vi.fn(({ title, content }) => Promise.resolve({ data: { id: 7, title, content } })),
  updateNote: vi.fn((id, { title, content }) => Promise.resolve({ data: { id, title, content } })),
  deleteNote: vi.fn(() => Promise.resolve({ data: { message: 'Note deleted.' } })),
}));

import { createNote, deleteNote, updateNote } from '../../api/notesApi';
import NotesPage from '../NotesPage';

test('creates, views, edits and deletes a study note', async () => {
  const { rerender } = render(<NotesPage />);

  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Arrays' } });
  fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Sliding window notes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create note' }));

  await waitFor(() => expect(createNote).toHaveBeenCalledWith({
    title: 'Arrays',
    content: 'Sliding window notes',
  }));
  rerender(<NotesPage />);
  await screen.findByText('Arrays');
});

test('loads existing notes and supports viewing, editing and deleting', async () => {
  const { fetchNotes } = await import('../../api/notesApi');
  fetchNotes.mockResolvedValueOnce({
    data: [{ id: 8, title: 'Trees', content: 'Traversal patterns' }],
  });
  render(<NotesPage />);

  await screen.findByText('Trees');
  fireEvent.click(screen.getByRole('button', { name: 'View' }));
  expect(screen.getByRole('region', { name: 'Selected note' }).querySelector('p')).toHaveTextContent('Traversal patterns');

  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Tree traversal' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(updateNote).toHaveBeenCalledWith(8, {
    title: 'Tree traversal',
    content: 'Traversal patterns',
  }));

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(deleteNote).toHaveBeenCalledWith(8));
});

import { useEffect, useState } from 'react';
import { createNote, deleteNote, fetchNotes, updateNote } from '../api/notesApi';

const emptyForm = { title: '', content: '' };

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadNotes = () => {
    setLoading(true);
    setError('');
    return fetchNotes()
      .then(({ data }) => setNotes(data))
      .catch((requestError) => {
        setError(requestError.response?.data?.error || 'Unable to load your notes. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const startNewNote = () => {
    setEditingId(null);
    setViewingId(null);
    setForm(emptyForm);
    setError('');
  };

  const editNote = (note) => {
    setEditingId(note.id);
    setViewingId(null);
    setForm({ title: note.title, content: note.content });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const { data } = await updateNote(editingId, form);
        setNotes((current) => current.map((note) => (note.id === editingId ? data : note)));
      } else {
        const { data } = await createNote(form);
        setNotes((current) => [data, ...current]);
      }
      startNewNote();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to save this note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note) => {
    setError('');
    try {
      await deleteNote(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
      if (viewingId === note.id || editingId === note.id) startNewNote();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete this note. Please try again.');
    }
  };

  const viewedNote = notes.find((note) => note.id === viewingId);

  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Study notes</h1>
      <p>Your notes are private to your account.</p>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      <section aria-label="Your notes">
        <h2>Your notes</h2>
        {loading ? (
          <p role="status">Loading your notes...</p>
        ) : notes.length ? (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
            {notes.map((note) => (
              <li key={note.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
                <strong>{note.title}</strong>
                <p>{note.content.slice(0, 160)}{note.content.length > 160 ? '…' : ''}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setViewingId(note.id)}>View</button>
                  <button type="button" onClick={() => editNote(note)}>Edit</button>
                  <button type="button" onClick={() => handleDelete(note)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes yet. Create a note to save your study material.</p>
        )}
      </section>

      {viewedNote && (
        <section aria-label="Selected note" style={{ marginTop: '1.5rem', border: '1px solid #ddd', padding: '1rem' }}>
          <h2>{viewedNote.title}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{viewedNote.content}</p>
          <button type="button" onClick={() => setViewingId(null)}>Close note</button>
        </section>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h2>{editingId ? 'Edit note' : 'Create a note'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
              maxLength={200}
              style={{ display: 'block', width: '100%', padding: '0.6rem' }}
            />
          </label>
          <label>
            Content
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              required
              rows={8}
              style={{ display: 'block', width: '100%', padding: '0.6rem' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create note'}</button>
            {editingId && <button type="button" onClick={startNewNote}>Cancel</button>}
          </div>
        </form>
      </section>

      {!loading && error && (
        <button type="button" onClick={loadNotes} style={{ marginTop: '0.75rem' }}>Retry loading</button>
      )}
    </main>
  );
}

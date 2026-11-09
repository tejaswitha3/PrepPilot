import { useEffect, useMemo, useState } from 'react';
import { fetchAttempts } from '../api/questionApi';

export function serializeAttemptsCsv(attempts) {
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [['id', 'question_text', 'category', 'topic', 'selected_answer', 'correct_answer', 'explanation', 'is_correct', 'created_at']];
  attempts.forEach((attempt) => rows.push([
    attempt.id,
    attempt.question_text,
    attempt.category,
    attempt.topic,
    attempt.selected_answer,
    attempt.correct_answer,
    attempt.explanation,
    attempt.is_correct,
    attempt.created_at,
  ]));
  return rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

export default function ResultsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [openExplanations, setOpenExplanations] = useState(new Set());
  const [announce, setAnnounce] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttempts()
      .then(({ data }) => setAttempts(data))
      .catch(() => setError('Unable to load your results. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const total = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  const categories = useMemo(() => Array.from(new Set(attempts.map((a) => a.category).filter(Boolean))), [attempts]);
  const topics = useMemo(() => Array.from(new Set(attempts.map((a) => a.topic).filter(Boolean))), [attempts]);

  const filtered = useMemo(() => attempts.filter((a) => {
    if (categoryFilter && a.category !== categoryFilter) return false;
    if (topicFilter && a.topic !== topicFilter) return false;
    return true;
  }), [attempts, categoryFilter, topicFilter]);

  const exportCSV = () => {
    const csv = serializeAttemptsCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attempts.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setAnnounce(`${filtered.length} attempts exported`);
  };

  const toggleExplanation = (id) => {
    setOpenExplanations((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  return (
    <main className="page-shell">
      <h1>Results</h1>

      {loading ? (
        <p role="status">Loading your recent attempts...</p>
      ) : error ? (
        <p role="alert" style={{ color: 'crimson' }}>{error}</p>
      ) : (
        <>
          <div className="results-toolbar">
            <div className="results-summary">
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div>Total attempts</div>
              <strong>{total}</strong>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div>Correct</div>
              <strong>{correct}</strong>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div>Accuracy</div>
              <strong>{accuracy}%</strong>
            </div>
            </div>
            <div className="results-filters">
              <label htmlFor="filter-category">Category</label>
              <select id="filter-category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setAnnounce(`Filtered by category ${e.target.value || 'all'}`); }}>
                <option value="">All</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <label htmlFor="filter-topic">Topic</label>
              <select id="filter-topic" value={topicFilter} onChange={(e) => { setTopicFilter(e.target.value); setAnnounce(`Filtered by topic ${e.target.value || 'all'}`); }}>
                <option value="">All</option>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <button type="button" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>

          <div aria-live="polite" className="sr-only">{announce}</div>

          {filtered.length === 0 ? (
            <p>
              {attempts.length === 0
                ? 'No attempts yet. Practice to generate results.'
                : 'No attempts match the selected filters.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filtered.map((a) => (
                <article key={a.id} className="result-card">
                  <div className="result-header">
                    <div>
                      <strong>{a.question_text}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {a.category} · {a.topic} {a.company ? `· ${a.company} practice example (not an actual past interview question)` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{a.is_correct ? 'Correct' : 'Incorrect'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(a.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div>Your answer: {a.selected_answer || 'Unavailable'}</div>
                    <div>Correct answer: {a.correct_answer || 'Unavailable'}</div>
                  </div>
                  {a.explanation?.trim() ? (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        aria-expanded={openExplanations.has(a.id)}
                        aria-controls={`attempt-explanation-${a.id}`}
                        onClick={() => toggleExplanation(a.id)}
                      >
                        {openExplanations.has(a.id) ? 'Hide explanation' : 'Show explanation'}
                      </button>
                      <p
                        id={`attempt-explanation-${a.id}`}
                        hidden={!openExplanations.has(a.id)}
                        style={{ marginTop: '0.5rem' }}
                      >
                        {a.explanation}
                      </p>
                    </div>
                  ) : (
                    <p role="status" style={{ marginTop: '0.75rem' }}>
                      Explanation is not available for this question.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

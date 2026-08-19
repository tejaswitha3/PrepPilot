import { useEffect, useMemo, useState } from 'react';
import { fetchAttempts } from '../api/questionApi';

export default function ResultsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [openExplanations, setOpenExplanations] = useState(new Set());
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    fetchAttempts()
      .then(({ data }) => setAttempts(data))
      .catch(() => setAttempts([]))
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
    const rows = [['id','question_text','category','topic','selected_answer','is_correct','created_at']];
    filtered.forEach((r) => rows.push([r.id, `"${(r.question_text||'').replace(/"/g,'""')}"`, r.category||'', r.topic||'', r.selected_answer||'', r.is_correct, r.created_at]));
    const csv = rows.map((r) => r.join(',')).join('\n');
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
    <div style={{ padding: '2rem' }}>
      <h1>Results</h1>

      {loading ? (
        <p>Loading your recent attempts...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
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
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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

          {attempts.length === 0 ? (
            <p>No attempts yet. Practice to generate results.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {attempts.map((a) => (
                <div key={a.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{a.question_text}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {a.category} · {a.topic} {a.company ? `· ${a.company}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{a.is_correct ? 'Correct' : 'Incorrect'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(a.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div>Answer: {a.selected_answer}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

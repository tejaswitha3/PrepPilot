import { useEffect, useState } from 'react';
import { fetchProgress, fetchCategoryProgress } from '../api/progressApi';

export default function ProgressPage() {
  const [stats, setStats] = useState({ attempted: 0, solved: 0, accuracy: 0, weak_topics: [] });
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProgress(), fetchCategoryProgress()])
      .then(([res1, res2]) => {
        setStats(res1.data || { attempted: 0, solved: 0, accuracy: 0, weak_topics: [] });
        setCategories(res2.data || {});
      })
      .catch(() => {
        setStats({ attempted: 0, solved: 0, accuracy: 0, weak_topics: [] });
        setCategories({});
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Progress</h1>

      {loading ? (
        <p>Loading progress...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <div>Attempted</div>
              <strong>{stats.attempted}</strong>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <div>Solved</div>
              <strong>{stats.solved}</strong>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <div>Accuracy</div>
              <strong>{stats.accuracy}%</strong>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Weak Topics</h3>
            {stats.weak_topics && stats.weak_topics.length ? (
              <ul>
                {stats.weak_topics.map((t) => (
                  <li key={t.topic}>{t.topic}: {t.score}%</li>
                ))}
              </ul>
            ) : (
              <p>No weak topics yet.</p>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Category Breakdown</h3>
            {Object.keys(categories).length ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {Object.entries(categories).map(([cat, vals]) => (
                  <div key={cat} style={{ border: '1px solid #eee', padding: '0.75rem', borderRadius: '8px' }}>
                    <strong>{cat}</strong>
                    <div>Attempted: {vals.attempted}</div>
                    <div>Solved: {vals.solved}</div>
                    <div>Accuracy: {vals.accuracy}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No category breakdown available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

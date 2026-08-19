import { useEffect, useState } from 'react';
import { fetchProgress } from '../api/progressApi';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ attempted: 0, solved: 0, accuracy: 0, weak_topics: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress()
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ attempted: 0, solved: 0, accuracy: 0, weak_topics: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.name || 'student'}.</p>

      {loading ? (
        <p>Loading your progress...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
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
            {stats.weak_topics.length ? (
              <ul>
                {stats.weak_topics.map((topic) => (
                  <li key={topic.topic}>
                    {topic.topic}: {topic.score}%
                  </li>
                ))}
              </ul>
            ) : (
              <p>No weak topics yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPreparation } from '../api/questionApi';
import './PreparationPage.css';

export default function PreparationPage() {
  const [data, setData] = useState({ categories: [] });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreparation()
      .then(({ data }) => setData(data))
      .catch(() => setError('Unable to load preparation content. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => data.categories || [], [data]);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === selectedCategoryId) || null, [categories, selectedCategoryId]);
  const selectedTopic = useMemo(() => (selectedCategory ? selectedCategory.topics.find((t) => t.id === selectedTopicId) : null), [selectedCategory, selectedTopicId]);
  const practiceParams = new URLSearchParams();
  if (selectedCategory && selectedTopic) {
    practiceParams.set('category', selectedTopic.question_category || selectedCategory.question_category || selectedCategory.name);
    practiceParams.set('topic', selectedTopic.question_topic || selectedTopic.name);
    if (selectedTopic.company) {
      practiceParams.set('company', selectedTopic.company);
    }
  }

  const categoryRefs = useRef([]);
  const topicRefs = useRef([]);
  const [announcement, setAnnouncement] = useState('');

  const handleCategoryButtonKeyDown = (e, idx, cat) => {
    const len = categories.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % len;
      categoryRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + len) % len;
      categoryRefs.current[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedCategoryId(cat.id);
      setSelectedTopicId(null);
    }
  };

  const handleTopicButtonKeyDown = (e, idx, topics) => {
    const len = topics.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % len;
      topicRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + len) % len;
      topicRefs.current[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedTopicId(topics[idx].id);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      setAnnouncement(`${selectedCategory?.name || 'Category'}: ${selectedTopic.name} selected`);
    } else if (selectedCategory) {
      setAnnouncement(`${selectedCategory.name} selected. ${selectedCategory.topics.length} topics available.`);
    }
  }, [selectedCategoryId, selectedTopicId]);

  if (loading) {
    return <div role="status" className="page-shell">Loading preparation content...</div>;
  }

  return (
    <main className="page-shell">
      <h1>Preparation</h1>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      <div aria-live="polite" className="sr-only">{announcement}</div>

      <div className="preparation-layout">
          <div className="preparation-categories">
          <h3 id="prep-categories-heading">Categories</h3>
          <ul role="listbox" aria-labelledby="prep-categories-heading" style={{ listStyle: 'none', padding: 0 }}>
            {categories.map((cat, idx) => (
              <li key={cat.id} style={{ marginBottom: '0.5rem' }}>
                <button
                  ref={(el) => (categoryRefs.current[idx] = el)}
                  type="button"
                  role="option"
                  aria-selected={selectedCategoryId === cat.id}
                  onKeyDown={(e) => handleCategoryButtonKeyDown(e, idx, cat)}
                  onClick={() => { setSelectedCategoryId(cat.id); setSelectedTopicId(null); }}
                  className={`prep-button ${selectedCategoryId === cat.id ? 'prep-selected' : ''}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          {!selectedCategory ? (
            <div>
              <h3>Select a category to view topics</h3>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{selectedCategory.name}</h2>
                <div>
                  <button type="button" onClick={() => { setSelectedCategoryId(null); setSelectedTopicId(null); }}>Back to categories</button>
                </div>
              </div>

              <div className="preparation-topics-layout">
                  <div className="preparation-topics">
                  <h4 id="prep-topics-heading">Topics</h4>
                  <ul role="listbox" aria-labelledby="prep-topics-heading" style={{ listStyle: 'none', padding: 0 }}>
                    {selectedCategory.topics.map((topic, tIdx) => (
                      <li key={topic.id} style={{ marginBottom: '0.5rem' }}>
                        <button
                          ref={(el) => (topicRefs.current[tIdx] = el)}
                          type="button"
                          role="option"
                          aria-selected={selectedTopicId === topic.id}
                          onKeyDown={(e) => handleTopicButtonKeyDown(e, tIdx, selectedCategory.topics)}
                          onClick={() => setSelectedTopicId(topic.id)}
                          className={`prep-button ${selectedTopicId === topic.id ? 'prep-selected' : ''}`}
                        >
                          {topic.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="topic-overview">
                  {!selectedTopic ? (
                    <div>
                      <h4>Topic overview</h4>
                      <p>Select a topic to see an introduction and study pointers.</p>
                    </div>
                  ) : (
                    <div>
                      <h3>{selectedTopic.name}</h3>
                      <p>{selectedTopic.intro}</p>
                      <div style={{ marginTop: '1rem' }}>
                        <h5>Study tips</h5>
                        <ul>
                          <li>Review the concept overview and use trusted references to explore unfamiliar ideas.</li>
                          <li>For coding practice, use a trusted external problem set; practice here uses multiple-choice questions.</li>
                          <li>Review common patterns and optimal approaches.</li>
                        </ul>
                      </div>
                      <Link
                        to={`/practice?${practiceParams.toString()}`}
                        className="prep-button"
                        style={{ display: 'inline-block', width: 'auto', marginTop: '1rem', textDecoration: 'none' }}
                      >
                        Start practice for {selectedTopic.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

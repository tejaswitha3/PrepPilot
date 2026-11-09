import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchQuestions, submitAttempt } from '../api/questionApi';

export default function PracticePage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const topic = searchParams.get('topic') || '';
  const company = searchParams.get('company') || '';
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const filters = {
      ...(category && { category }),
      ...(topic && { topic }),
      ...(company && { company }),
    };

    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setResult(null);
    setError('');
    setLoading(true);

    fetchQuestions(filters)
      .then(({ data }) => {
        if (active) setQuestions(data);
      })
      .catch(() => {
        if (active) setError('Unable to load practice questions. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, topic, company]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer || submitting || result) return;

    setError('');
    setSubmitting(true);
    try {
      const { data } = await submitAttempt(currentQuestion.id, { selected_answer: selectedAnswer });
      setResult({
        isCorrect: data.is_correct,
        message: data.is_correct ? 'Correct answer!' : `Incorrect. The correct answer is ${data.correct_answer}.`,
        explanation: data.explanation,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'There was an issue submitting your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setResult(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  if (loading) {
    return <div role="status" className="page-shell">Loading practice questions...</div>;
  }

  if (!currentQuestion) {
    return (
      <main className="page-shell">
        <h1>Practice</h1>
        {error ? (
          <p role="alert" style={{ color: 'crimson' }}>{error}</p>
        ) : topic ? (
          <p role="status">
            No questions are available for {topic} yet. <Link to="/preparation">Choose another topic</Link> or{' '}
            <Link to="/practice">practice all questions</Link>.
          </p>
        ) : (
          <p>No practice questions available right now.</p>
        )}
      </main>
    );
  }

  return (
    <main className="page-shell" style={{ maxWidth: '840px' }}>
      <h1>Practice</h1>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      <p>
        {currentQuestion.category} · {currentQuestion.topic}
        {currentQuestion.company
          ? ` · ${currentQuestion.company} practice example (not an actual past interview question)`
          : ''}
      </p>

      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '1.5rem' }}>
        <h3>{currentQuestion.question_text}</h3>

        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedAnswer(option)}
              disabled={submitting || !!result}
              style={{
                textAlign: 'left',
                padding: '0.75rem',
                borderRadius: '8px',
                border: selectedAnswer === option ? '2px solid #2d6cdf' : '1px solid #ccc',
                background: selectedAnswer === option ? '#eef4ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="button" onClick={handleSubmit} disabled={!selectedAnswer || !!result || submitting}>
            {submitting ? 'Submitting...' : 'Submit answer'}
          </button>
          <button type="button" onClick={handleNext}>
            Next question
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              background: result.isCorrect ? '#eafaf1' : '#fff1f1',
              border: `1px solid ${result.isCorrect ? '#9ad7b4' : '#f1b5b5'}`,
            }}
          >
            <strong>{result.message}</strong>
            {result.explanation && <p style={{ marginTop: '0.75rem' }}>{result.explanation}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

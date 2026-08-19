import { useEffect, useState } from 'react';
import { fetchQuestions, submitAttempt } from '../api/questionApi';

export default function PracticePage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions()
      .then(({ data }) => setQuestions(data))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer) return;

    try {
      const { data } = await submitAttempt(currentQuestion.id, { selected_answer: selectedAnswer });
      setResult({
        isCorrect: data.is_correct,
        message: data.is_correct ? 'Correct answer!' : `Incorrect. The correct answer is ${data.correct_answer}.`,
        explanation: data.explanation,
      });
    } catch (error) {
      setResult({
        isCorrect: false,
        message: 'There was an issue submitting your answer. Please try again.',
        explanation: '',
      });
    }
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setResult(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading practice questions...</div>;
  }

  if (!currentQuestion) {
    return <div style={{ padding: '2rem' }}>No practice questions available right now.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Practice</h1>
      <p>
        {currentQuestion.category} · {currentQuestion.topic}
        {currentQuestion.company ? ` · ${currentQuestion.company}` : ''}
      </p>

      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '1.5rem' }}>
        <h3>{currentQuestion.question_text}</h3>

        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedAnswer(option)}
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
          <button type="button" onClick={handleSubmit} disabled={!selectedAnswer || !!result}>
            Submit answer
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
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="page-shell landing-page">
      <section className="landing-hero">
        <p className="eyebrow">Interview preparation, at your pace</p>
        <h1>Build confidence one practice session at a time.</h1>
        <p>Study practical interview topics, answer questions, review explanations, and track your progress in one place.</p>
        <div className="landing-actions">
          <Link className="button-link button-primary" to="/register">Get started</Link>
          <Link className="button-link" to="/login">Log in</Link>
        </div>
      </section>
      <section className="feature-grid" aria-label="PrepPilot features">
        <article className="feature-card">
          <h2>Topic guides</h2>
          <p>Browse short introductions and pointers across DSA, aptitude, technical subjects, and interview preparation.</p>
        </article>
        <article className="feature-card">
          <h2>Question practice</h2>
          <p>Practice multiple-choice questions by topic, submit answers, and review explanations.</p>
        </article>
        <article className="feature-card">
          <h2>Progress and notes</h2>
          <p>Keep private study notes and see summaries of your saved question attempts.</p>
        </article>
      </section>
    </main>
  );
}

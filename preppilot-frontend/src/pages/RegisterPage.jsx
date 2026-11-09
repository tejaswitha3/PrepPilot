import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(form);
      const { data } = await loginUser({ email: form.email, password: form.password });
      login(data.access_token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-card">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          <input
            type="text"
            name="name"
            aria-label="Full name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ padding: '0.75rem' }}
          />
          <input
            type="email"
            name="email"
            aria-label="Email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            maxLength={120}
            required
            style={{ padding: '0.75rem' }}
          />
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
            style={{ padding: '0.75rem' }}
          />
          <input
            type="password"
            name="confirm_password"
            aria-label="Confirm password"
            placeholder="Confirm password"
            value={form.confirm_password}
            onChange={handleChange}
            minLength={6}
            required
            style={{ padding: '0.75rem' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '0.8rem', cursor: 'pointer' }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </div>
      </form>
      {error && <p role="alert" style={{ color: 'crimson', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}

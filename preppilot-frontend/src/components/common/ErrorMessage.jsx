export default function ErrorMessage({ message }) {
  return <div style={{ color: 'crimson', marginTop: '0.5rem' }}>{message || 'Something went wrong.'}</div>;
}

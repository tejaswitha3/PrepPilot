export default function Card({ title, children }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', margin: '1rem 0' }}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

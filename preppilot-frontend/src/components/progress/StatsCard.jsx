export default function StatsCard({ label, value }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', minWidth: '150px' }}>
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

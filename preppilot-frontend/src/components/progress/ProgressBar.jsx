export default function ProgressBar({ value = 0, label = 'Progress' }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ width: '100%', background: '#eee', height: '10px', borderRadius: '999px', marginTop: '0.5rem' }}>
        <div style={{ width: `${value}%`, background: '#3b82f6', height: '100%', borderRadius: '999px' }} />
      </div>
    </div>
  );
}

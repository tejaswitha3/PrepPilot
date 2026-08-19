import { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../api/profileApi';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProfile()
      .then(({ data }) => {
        // expects { user: {...}, progress: {...} }
        setProfile(data || null);
        setEditingName(data?.user?.name || '');
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    if (!editingName || !editingName.trim()) return setMessage('Name is required.');
    setSaving(true);
    updateProfile({ name: editingName.trim() })
      .then(({ data }) => {
        setProfile(data);
        setMessage('Profile updated.');
      })
      .catch(() => setMessage('Failed to update profile.'))
      .finally(() => setSaving(false));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Profile</h1>

      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <div style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#444' }}>Name</label>
            <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={{ padding: '0.5rem', width: '100%', marginTop: '0.25rem' }} />
            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div><strong>Email:</strong> {profile.user.email}</div>
            <div><strong>Member since:</strong> {profile.user.created_at ? new Date(profile.user.created_at).toLocaleDateString() : 'N/A'}</div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>Preparation Stats</h3>
            {profile.progress ? (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ border: '1px solid #ddd', padding: '0.75rem', borderRadius: '8px' }}>
                  <div>Attempted</div>
                  <strong>{profile.progress.attempted}</strong>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '0.75rem', borderRadius: '8px' }}>
                  <div>Solved</div>
                  <strong>{profile.progress.solved}</strong>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '0.75rem', borderRadius: '8px' }}>
                  <div>Accuracy</div>
                  <strong>{profile.progress.accuracy}%</strong>
                </div>
              </div>
            ) : (
              <p>No preparation stats available.</p>
            )}
          </div>

          {message && <div style={{ marginTop: '1rem', color: message.includes('Failed') ? 'crimson' : 'green' }}>{message}</div>}
        </div>
      ) : (
        <p>Profile not found.</p>
      )}
    </div>
  );
}

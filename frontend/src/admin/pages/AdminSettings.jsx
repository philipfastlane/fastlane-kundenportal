import { useState } from 'react';
import { KeyRound, Check } from 'lucide-react';
import api from '../../api';

export default function AdminSettings() {
  const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.new_password !== form.confirm_password) {
      return setError('Neue Passwörter stimmen nicht überein.');
    }
    if (form.new_password.length < 8) {
      return setError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
    }

    setSaving(true);
    try {
      await api.put('/admin/auth/profile', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Einstellungen</h1>
          <p className="page-subtitle">Admin-Konto verwalten</p>
        </div>
      </div>

      <div style={{ maxWidth: 480 }}>
        <div className="card">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <span className="card-title">
              <KeyRound size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Passwort ändern
            </span>
          </div>

          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            Angemeldet als <strong style={{ color: 'var(--text)' }}>{admin.name}</strong> ({admin.email})
          </div>

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(168,204,48,0.12)', border: '1px solid rgba(168,204,48,0.3)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--accent)' }}>
              <Check size={15} /> Passwort erfolgreich geändert.
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Aktuelles Passwort</label>
              <input
                type="password"
                className="form-input"
                value={form.current_password}
                onChange={set('current_password')}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="form-label">Neues Passwort</label>
              <input
                type="password"
                className="form-input"
                value={form.new_password}
                onChange={set('new_password')}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="form-label">Neues Passwort bestätigen</label>
              <input
                type="password"
                className="form-input"
                value={form.confirm_password}
                onChange={set('confirm_password')}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 4 }}>
              {saving ? 'Wird gespeichert...' : 'Passwort ändern'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

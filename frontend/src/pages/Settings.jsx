import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings as SettingsIcon, Lock, User, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const mustChange = searchParams.get('erstanmeldung') === '1';

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setProfile(data);
      setName(data.name);
    });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { data } = await api.put('/profile', { name });
      setProfile(data);
      setName(data.name);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: data.name }));
      setProfileMsg({ type: 'success', text: 'Name erfolgreich gespeichert.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Fehler beim Speichern.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Die neuen Passwörter stimmen nicht überein.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const { data } = await api.put('/profile', { current_password: currentPw, new_password: newPw });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, must_change_password: false }));
      setProfile(data);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwMsg({ type: 'success', text: 'Passwort erfolgreich geändert.' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Fehler beim Ändern des Passworts.' });
    } finally {
      setPwLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon size={22} /> Einstellungen
          </h1>
          <p className="page-subtitle">Persönliche Daten und Passwort verwalten</p>
        </div>
      </div>

      {mustChange && (
        <div style={{
          background: '#fff8e1', border: '1px solid #f0c040', borderRadius: 10,
          padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 14, color: '#7a5c00',
        }}>
          <AlertTriangle size={18} color="#e0a800" style={{ flexShrink: 0 }} />
          <span>Bitte ändern Sie Ihr Einmalpasswort, bevor Sie das Portal nutzen.</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
        {/* Profile section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <User size={17} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Persönliche Daten</span>
          </div>

          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">E-Mail-Adresse</label>
              <input className="form-input" value={profile.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            {profile.company && (
              <div className="form-group">
                <label className="form-label">Unternehmen</label>
                <input className="form-input" value={profile.company} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            )}

            {profileMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13,
                color: profileMsg.type === 'success' ? '#4a7c00' : '#c0392b' }}>
                {profileMsg.type === 'success' ? <CheckCircle size={15} /> : null}
                {profileMsg.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Wird gespeichert...' : 'Speichern'}
            </button>
          </form>
        </div>

        {/* Password section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Lock size={17} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Passwort ändern</span>
          </div>

          <form onSubmit={savePassword}>
            <div className="form-group">
              <label className="form-label">Aktuelles Passwort</label>
              <input
                type="password"
                className="form-input"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Neues Passwort</label>
              <input
                type="password"
                className="form-input"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Neues Passwort bestätigen</label>
              <input
                type="password"
                className="form-input"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            {pwMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13,
                color: pwMsg.type === 'success' ? '#4a7c00' : '#c0392b' }}>
                {pwMsg.type === 'success' ? <CheckCircle size={15} /> : null}
                {pwMsg.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Wird geändert...' : 'Passwort ändern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

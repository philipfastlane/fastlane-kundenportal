import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings as SettingsIcon, Lock, User, CheckCircle, AlertTriangle, Shield, Trash2 } from 'lucide-react';
import api from '../api';

function pwScore(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = pwScore(password);
  const labels = ['Zu schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
  const colors = ['#e53e3e', '#e53e3e', '#ed8936', 'var(--accent)', 'var(--accent)'];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[score] : 'var(--border)', transition: 'background .2s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</div>
    </div>
  );
}

const Msg = ({ msg }) => msg ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13,
    color: msg.type === 'success' ? 'var(--accent)' : '#c0392b' }}>
    {msg.type === 'success' && <CheckCircle size={15} />}
    {msg.text}
  </div>
) : null;

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

  const [twoFa, setTwoFa] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setProfile(data);
      setName(data.name);
      setTwoFa(!!data.two_fa_enabled);
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
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setPwMsg({ type: 'success', text: 'Passwort erfolgreich geändert.' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Fehler beim Ändern des Passworts.' });
    } finally {
      setPwLoading(false);
    }
  };

  const toggle2FA = async () => {
    setTwoFaLoading(true);
    try {
      const { data } = await api.put('/profile/2fa', { enabled: !twoFa });
      setTwoFa(!!data.two_fa_enabled);
    } catch {
      // silent
    } finally {
      setTwoFaLoading(false);
    }
  };

  if (!profile) return null;

  const deletionMailto = `mailto:philip@fastlanesolutions.de?subject=L%C3%B6schanfrage%20Kundenportal&body=Sehr%20geehrtes%20FastLane-Team%2C%0A%0Aich%20beantrage%20gem%C3%A4%C3%9F%20Art.%2017%20DSGVO%20die%20L%C3%B6schung%20meiner%20Daten%20aus%20dem%20Kundenportal.%0A%0AKonto%3A%20${encodeURIComponent(profile.email)}%0A%0AMit%20freundlichen%20Gr%C3%BC%C3%9Fen`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon size={22} /> Einstellungen
          </h1>
          <p className="page-subtitle">Persönliche Daten und Sicherheit verwalten</p>
        </div>
      </div>

      {mustChange && (
        <div style={{ background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.4)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#7a5c00' }}>
          <AlertTriangle size={18} color="#e0a800" style={{ flexShrink: 0 }} />
          <span>Bitte ändern Sie Ihr Einmalpasswort, bevor Sie das Portal nutzen.</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>

        {/* Persönliche Daten */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <User size={17} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Persönliche Daten</span>
          </div>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
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
            <Msg msg={profileMsg} />
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Wird gespeichert...' : 'Speichern'}
            </button>
          </form>
        </div>

        {/* Passwort ändern */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Lock size={17} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Passwort ändern</span>
          </div>
          <form onSubmit={savePassword}>
            <div className="form-group">
              <label className="form-label">Aktuelles Passwort</label>
              <input type="password" className="form-input" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Neues Passwort</label>
              <input type="password" className="form-input" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 Zeichen, Groß- & Kleinbuchstabe, Zahl, Sonderzeichen" required autoComplete="new-password" />
              <PasswordStrength password={newPw} />
            </div>
            <div className="form-group">
              <label className="form-label">Neues Passwort bestätigen</label>
              <input type="password" className="form-input" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
            </div>
            <Msg msg={pwMsg} />
            <button type="submit" className="btn btn-primary" disabled={pwLoading || pwScore(newPw) < 4}>
              {pwLoading ? 'Wird geändert...' : 'Passwort ändern'}
            </button>
          </form>
        </div>

        {/* Zwei-Faktor-Authentifizierung */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={17} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Zwei-Faktor-Authentifizierung</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Bei aktivierter 2FA erhalten Sie bei jeder Anmeldung einen Einmal-Code per E-Mail. Dies schützt Ihr Konto auch dann, wenn Ihr Passwort in fremde Hände gerät.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: twoFa ? 'var(--accent)' : 'var(--text-muted)', fontWeight: twoFa ? 600 : 400 }}>
              {twoFa ? '2FA ist aktiv' : '2FA ist deaktiviert'}
            </span>
            <button
              onClick={toggle2FA}
              disabled={twoFaLoading}
              className={`btn ${twoFa ? 'btn-secondary' : 'btn-primary'}`}
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              {twoFaLoading ? '...' : twoFa ? '2FA deaktivieren' : '2FA aktivieren'}
            </button>
          </div>
        </div>

        {/* Datenlöschung */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Trash2 size={17} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Datenlöschung (DSGVO Art. 17)</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Sie haben das Recht auf Löschung Ihrer personenbezogenen Daten. Klicken Sie auf den Button, um eine Löschanfrage an unser Team zu senden. Wir bearbeiten Ihre Anfrage innerhalb von 30 Tagen.
          </p>
          <a href={deletionMailto} className="btn btn-secondary" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Trash2 size={14} /> Löschanfrage senden
          </a>
        </div>

      </div>
    </div>
  );
}

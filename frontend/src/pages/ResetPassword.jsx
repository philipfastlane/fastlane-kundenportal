import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

function FastLaneLogo() {
  return (
    <div className="logo-text">
      <span className="logo-fast">FastLane</span>
      <span className="logo-solutions"> Solutions</span>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (form.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <nav className="login-nav"><FastLaneLogo /><span className="portal-btn">Kundenportal</span></nav>
        <div className="login-body">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
            <h1 className="login-title" style={{ fontSize: 20 }}>Ungültiger Link</h1>
            <p className="login-subtitle">Dieser Link zum Zurücksetzen des Passworts ist ungültig.</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 16, justifyContent: 'center' }}>Zur Anmeldung</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <nav className="login-nav">
        <FastLaneLogo />
        <span className="portal-btn">Kundenportal</span>
      </nav>

      <div className="login-body">
        <div className="login-card">
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(168,204,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="var(--accent)" />
              </div>
              <h1 className="login-title" style={{ fontSize: 22 }}>Passwort gesetzt!</h1>
              <p className="login-subtitle">Ihr Passwort wurde erfolgreich geändert. Sie werden in wenigen Sekunden zur Anmeldung weitergeleitet...</p>
            </div>
          ) : (
            <>
              <div className="login-header">
                <div className="login-eyebrow">FastLane Kundenportal</div>
                <h1 className="login-title">Neues Passwort</h1>
                <p className="login-subtitle">Vergeben Sie ein neues Passwort für Ihr Konto.</p>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Neues Passwort</label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Mindestens 8 Zeichen"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirm">Passwort bestätigen</label>
                  <input
                    id="confirm"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}
                  disabled={loading}
                >
                  {loading ? 'Wird gespeichert...' : 'Passwort speichern'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

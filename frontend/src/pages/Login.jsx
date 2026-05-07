import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../api';

const legalLink = { fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', transition: 'color .15s' };

function FastLaneLogo() {
  return (
    <div className="logo-text">
      <span className="logo-fast">FastLane</span>
      <span className="logo-solutions"> Solutions</span>
    </div>
  );
}

export default function Login() {
  const [step, setStep]           = useState('login'); // 'login' | 'otp'
  const [form, setForm]           = useState({ email: '', password: '' });
  const [otp, setOtp]             = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.requires_2fa) {
        setPendingEmail(data.email);
        setStep('otp');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.must_change_password ? '/einstellungen?erstanmeldung=1' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-2fa', { email: pendingEmail, code: otp.trim() });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.must_change_password ? '/einstellungen?erstanmeldung=1' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Code ungültig oder abgelaufen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-nav">
        <FastLaneLogo />
        <span className="portal-btn">Kundenportal</span>
      </nav>

      <div className="login-body">
        <div className="login-card">
          {step === 'login' ? (
            <>
              <div className="login-header">
                <div className="login-eyebrow">FastLane Kundenportal</div>
                <h1 className="login-title">Willkommen zurück.</h1>
                <p className="login-subtitle">Melden Sie sich mit Ihren Zugangsdaten an.</p>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">E-Mail-Adresse</label>
                  <input
                    id="email" type="email" className="form-input"
                    placeholder="ihre@email.de"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required autoComplete="email" autoFocus
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Passwort</label>
                    <Link to="/passwort-vergessen" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                      Passwort vergessen?
                    </Link>
                  </div>
                  <input
                    id="password" type="password" className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}
                  disabled={loading}
                >
                  {loading ? 'Wird angemeldet...' : 'Anmelden'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="login-header">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(168,204,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} color="var(--accent)" />
                  </div>
                </div>
                <div className="login-eyebrow">Zwei-Faktor-Authentifizierung</div>
                <h1 className="login-title" style={{ fontSize: 22 }}>Code eingeben</h1>
                <p className="login-subtitle">
                  Wir haben einen 6-stelligen Code an <strong>{pendingEmail}</strong> gesendet. Er ist 10 Minuten gültig.
                </p>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleOtp}>
                <div className="form-group">
                  <label className="form-label" htmlFor="otp">Bestätigungscode</label>
                  <input
                    id="otp" type="text" inputMode="numeric" pattern="[0-9]{6}"
                    className="form-input"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required autoFocus autoComplete="one-time-code"
                    style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
                  />
                </div>
                <button
                  type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Wird geprüft...' : 'Bestätigen'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('login'); setOtp(''); setError(''); }}
                  style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: '8px' }}
                >
                  Zurück zur Anmeldung
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0 24px', display: 'flex', justifyContent: 'center', gap: 20 }}>
        <Link to="/impressum" style={legalLink}>Impressum</Link>
        <Link to="/datenschutz" style={legalLink}>Datenschutz</Link>
        <Link to="/agb" style={legalLink}>AGB</Link>
      </div>
    </div>
  );
}

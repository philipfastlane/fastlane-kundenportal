import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function FastLaneLogo() {
  return (
    <div className="logo-text">
      <span className="logo-fast">FastLane</span>
      <span className="logo-solutions"> Solutions</span>
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.must_change_password) {
        navigate('/einstellungen?erstanmeldung=1');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Top nav */}
      <nav className="login-nav">
        <FastLaneLogo />
        <span className="portal-btn">Kundenportal</span>
      </nav>

      {/* Login body */}
      <div className="login-body">
        <div className="login-card">
          <div className="login-header">
            <div className="login-eyebrow">FastLane Kundenportal</div>
            <h1 className="login-title">Willkommen zurück.</h1>
            <p className="login-subtitle">Melden Sie sich mit Ihren Zugangsdaten an.</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-Mail-Adresse</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="ihre@email.de"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                autoFocus
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
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}
              disabled={loading}
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

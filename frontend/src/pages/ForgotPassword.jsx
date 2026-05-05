import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../api';

function FastLaneLogo() {
  return (
    <div className="logo-text">
      <span className="logo-fast">FastLane</span>
      <span className="logo-solutions"> Solutions</span>
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
          {sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(168,204,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={24} color="var(--accent)" />
                </div>
                <h1 className="login-title" style={{ fontSize: 22 }}>E-Mail gesendet</h1>
                <p className="login-subtitle">
                  Falls ein Konto mit <strong>{email}</strong> existiert, haben wir einen Link zum Zurücksetzen Ihres Passworts gesendet.
                  Der Link ist 1 Stunde gültig.
                </p>
              </div>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                <ArrowLeft size={16} /> Zurück zur Anmeldung
              </Link>
            </>
          ) : (
            <>
              <div className="login-header">
                <div className="login-eyebrow">FastLane Kundenportal</div>
                <h1 className="login-title">Passwort vergessen?</h1>
                <p className="login-subtitle">Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen.</p>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 14 }}
                  disabled={loading}
                >
                  {loading ? 'Wird gesendet...' : 'Link senden'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  <ArrowLeft size={13} /> Zurück zur Anmeldung
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import adminApi from '../adminApi';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.post('/admin/auth/login', form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-nav">
        <div className="logo-text">
          <span className="logo-fast">FastLane</span>
          <span className="logo-solutions"> Solutions</span>
        </div>
        <span className="admin-nav-badge">Admin-Bereich</span>
      </nav>

      <div className="login-body">
        <div className="login-card">
          <div className="login-header">
            <div className="login-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} /> Admin-Zugang
            </div>
            <h1 className="login-title">Administration</h1>
            <p className="login-subtitle">Nur autorisierter Zugang.</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-Mail-Adresse</label>
              <input id="email" type="email" className="form-input"
                placeholder="admin@fastlane.de"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required autoComplete="email" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Passwort</label>
              <input id="password" type="password" className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}
              disabled={loading}>
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Receipt,
  UserRound, TicketCheck, LogOut, Menu, X, ShieldCheck, Activity, Sun, Moon, Settings,
} from 'lucide-react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

const getTheme = () => localStorage.getItem('theme') || 'dark';
const applyTheme = (t) => { localStorage.setItem('theme', t); document.documentElement.setAttribute('data-theme', t); };

const navItems = [
  { to: '/admin/dashboard',       icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/admin/kunden',          icon: Users,            label: 'Kunden'          },
  { to: '/admin/vertraege',       icon: FileText,         label: 'Verträge'        },
  { to: '/admin/rechnungen',      icon: Receipt,          label: 'Rechnungen'      },
  { to: '/admin/ansprechpartner', icon: UserRound,        label: 'Ansprechpartner' },
  { to: '/admin/tickets',         icon: TicketCheck,      label: 'Tickets'         },
  { to: '/admin/aktivitaeten',    icon: Activity,         label: 'Aktivitäten'     },
  { to: '/admin/einstellungen',   icon: Settings,         label: 'Einstellungen'   },
];

export default function AdminLayout() {
  const [open, setOpen]               = useState(false);
  const [theme, setThemeState]        = useState(getTheme);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown]     = useState(300);
  const countRef = useRef(null);
  const navigate = useNavigate();

  const toggleTheme = () => { const t = theme === 'dark' ? 'light' : 'dark'; setThemeState(t); applyTheme(t); };
  const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  }, [navigate]);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
    setCountdown(300);
  }, []);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    clearInterval(countRef.current);
  }, []);

  const resetTimer = useSessionTimeout(handleWarning, logout);

  useEffect(() => {
    if (showWarning) {
      countRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(countRef.current); return 0; }
          return c - 1;
        });
      }, 1000);
    } else {
      clearInterval(countRef.current);
    }
    return () => clearInterval(countRef.current);
  }, [showWarning]);

  const fmtCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <header className="global-header">
        <div className="logo-text">
          <span className="logo-fast">FastLane</span>
          <span className="logo-solutions"> Solutions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="admin-nav-badge">
            <ShieldCheck size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Admin
          </span>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} aria-label="Theme wechseln">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="hamburger-global" onClick={() => setOpen(!open)} aria-label="Menü">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="app-layout">
        <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

        <aside className={`sidebar ${open ? 'open' : ''}`}>
          <div className="sidebar-top">
            <div className="sidebar-company">Admin-Bereich</div>
            <div className="sidebar-user-name">{admin.name || 'Administrator'}</div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Verwaltung</div>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}>
                <Icon size={17} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{admin.name}</div>
              <div className="user-email">{admin.email}</div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={13} /> Abmelden
            </button>
          </div>
        </aside>

        <div className="main-content">
          <div className="page-body">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Session-Warning Modal */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 36px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏱</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Admin-Sitzung läuft ab</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Sie werden in <strong style={{ color: 'var(--accent)', fontSize: 16 }}>{fmtCountdown(countdown)}</strong> automatisch abgemeldet.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={logout}>Jetzt abmelden</button>
              <button className="btn btn-primary" onClick={() => { extendSession(); resetTimer(); }}>
                Sitzung verlängern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

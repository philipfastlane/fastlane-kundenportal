import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Receipt,
  TicketCheck, LogOut, Menu, X, Settings, Bell,
  Receipt as InvoiceIcon, FileText as ContractIcon, MessageSquare,
  Sun, Moon,
} from 'lucide-react';
import api from '../api';

const getTheme = () => localStorage.getItem('theme') || 'dark';
const applyTheme = (t) => { localStorage.setItem('theme', t); document.documentElement.setAttribute('data-theme', t); };

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/vertraege',       icon: FileText,         label: 'Verträge'        },
  { to: '/ansprechpartner', icon: Users,            label: 'Ansprechpartner' },
  { to: '/rechnungen',      icon: Receipt,          label: 'Rechnungen'      },
  { to: '/tickets',         icon: TicketCheck,      label: 'Support-Tickets' },
  { to: '/einstellungen',   icon: Settings,         label: 'Einstellungen'   },
];

const notifIcon = (type) => {
  if (type === 'new_invoice') return <InvoiceIcon size={14} color="var(--accent)" />;
  if (type === 'new_contract') return <ContractIcon size={14} color="var(--accent)" />;
  return <MessageSquare size={14} color="var(--accent)" />;
};

const fmtRelative = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Gerade eben';
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  return `vor ${Math.floor(h / 24)} Tag${Math.floor(h / 24) !== 1 ? 'en' : ''}`;
};

function FastLaneLogo() {
  return (
    <div className="logo-text">
      <span className="logo-fast">FastLane</span>
      <span className="logo-solutions"> Solutions</span>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme);
  const [notifications, setNotifications] = useState([]);
  const [showBell, setShowBell] = useState(false);

  const toggleTheme = () => { const t = theme === 'dark' ? 'light' : 'dark'; setThemeState(t); applyTheme(t); };
  const bellRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id) => {
    api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: 1 } : n));
  };

  const markAllRead = () => {
    api.post('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
    setShowBell(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const close = () => setOpen(false);

  return (
    <>
      <header className="global-header">
        <FastLaneLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="portal-btn">Kundenportal</span>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} aria-label="Theme wechseln">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Bell */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowBell(!showBell)}
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              aria-label="Benachrichtigungen"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: '#e53e3e', color: '#fff', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showBell && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 320,
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: 1000, overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Benachrichtigungen</span>
                  {unread > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Alle lesen
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      Keine Benachrichtigungen
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          padding: '12px 16px', borderBottom: '1px solid var(--border)',
                          background: n.read ? 'transparent' : 'rgba(168,204,48,0.06)',
                          cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ marginTop: 2, flexShrink: 0 }}>{notifIcon(n.type)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text)', lineHeight: 1.4 }}>{n.title}</div>
                          {n.message && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>}
                          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{fmtRelative(n.created_at)}</div>
                        </div>
                        {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="hamburger-global" onClick={() => setOpen(!open)} aria-label="Menü öffnen">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="app-layout">
        <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={close} />

        <aside className={`sidebar ${open ? 'open' : ''}`}>
          <div className="sidebar-top">
            <div className="sidebar-company">Kundenbereich</div>
            <div className="sidebar-user-name">{user.company || user.name}</div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Navigation</div>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={close}>
                <Icon size={17} />{label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', color: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div className="user-email" style={{ marginBottom: 0 }}>{user.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}><LogOut size={13} />Abmelden</button>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
              <a href="/impressum" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none' }}>Impressum</a>
              <a href="/datenschutz" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none' }}>Datenschutz</a>
            </div>
          </div>
        </aside>

        <div className="main-content">
          <div className="page-body">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

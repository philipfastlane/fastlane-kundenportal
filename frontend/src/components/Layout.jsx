import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Receipt,
  TicketCheck, LogOut, Menu, X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/vertraege',       icon: FileText,         label: 'Verträge'        },
  { to: '/ansprechpartner', icon: Users,            label: 'Ansprechpartner' },
  { to: '/rechnungen',      icon: Receipt,          label: 'Rechnungen'      },
  { to: '/tickets',         icon: TicketCheck,      label: 'Support-Tickets' },
];

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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Global Header */}
      <header className="global-header">
        <FastLaneLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="portal-btn">Kundenportal</span>
          <button
            className="hamburger-global"
            onClick={() => setOpen(!open)}
            aria-label="Menü öffnen"
          >
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
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={close}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={13} />
              Abmelden
            </button>
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

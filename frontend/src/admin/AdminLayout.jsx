import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Receipt,
  UserRound, TicketCheck, LogOut, Menu, X, ShieldCheck, Activity,
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard',       icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/admin/kunden',          icon: Users,            label: 'Kunden'          },
  { to: '/admin/vertraege',       icon: FileText,         label: 'Verträge'        },
  { to: '/admin/rechnungen',      icon: Receipt,          label: 'Rechnungen'      },
  { to: '/admin/ansprechpartner', icon: UserRound,        label: 'Ansprechpartner' },
  { to: '/admin/tickets',         icon: TicketCheck,      label: 'Tickets'         },
  { to: '/admin/aktivitaeten',    icon: Activity,         label: 'Aktivitäten'     },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <>
      <header className="global-header">
        <div className="logo-text">
          <span className="logo-fast">FastLane</span>
          <span className="logo-solutions"> Solutions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="admin-nav-badge">
            <ShieldCheck size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Admin
          </span>
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
    </>
  );
}

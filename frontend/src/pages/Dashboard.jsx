import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Receipt, TicketCheck, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';

const fmt = (amount) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([
      api.get('/contracts'),
      api.get('/invoices'),
      api.get('/tickets'),
    ]).then(([c, i, t]) => {
      setContracts(c.data);
      setInvoices(i.data);
      setTickets(t.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        Daten werden geladen...
      </div>
    );
  }

  const activeContracts = contracts.filter((c) => c.status === 'aktiv').length;
  const openInvoicesAmount = invoices
    .filter((i) => i.status !== 'bezahlt')
    .reduce((sum, i) => sum + i.amount, 0);
  const openTickets = tickets.filter((t) => t.status !== 'gelöst' && t.status !== 'geschlossen').length;
  const overdueCount = invoices.filter((i) => i.status === 'überfällig').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Willkommen, {user.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Hier ist Ihre aktuelle Übersicht für {user.company}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><FileText size={20} /></div>
          <div>
            <div className="stat-value">{activeContracts}</div>
            <div className="stat-label">Aktive Verträge</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Receipt size={20} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: openInvoicesAmount > 9999 ? 18 : undefined }}>
              {fmt(openInvoicesAmount)}
            </div>
            <div className="stat-label">Offene Rechnungen</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><TicketCheck size={20} /></div>
          <div>
            <div className="stat-value">{openTickets}</div>
            <div className="stat-label">Offene Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertCircle size={20} /></div>
          <div>
            <div className="stat-value">{overdueCount}</div>
            <div className="stat-label">Überfällige Rechnungen</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Aktuelle Support-Tickets</span>
            <Link to="/tickets" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
              Alle anzeigen <ArrowRight size={13} />
            </Link>
          </div>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted">Keine Tickets vorhanden.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tickets.slice(0, 4).map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-600 text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </div>
                    <div className="text-sm text-muted mt-4">{fmtDate(t.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <StatusBadge value={t.status} />
                    <PriorityBadge value={t.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Letzte Rechnungen</span>
            <Link to="/rechnungen" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
              Alle anzeigen <ArrowRight size={13} />
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted">Keine Rechnungen vorhanden.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {invoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="flex-between gap-8">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-600 text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.invoice_number}
                    </div>
                    <div className="text-sm text-muted mt-4">{fmt(inv.amount)}</div>
                  </div>
                  <StatusBadge value={inv.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Vertragsübersicht</span>
            <Link to="/vertraege" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
              Details <ArrowRight size={13} />
            </Link>
          </div>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted">Keine Verträge vorhanden.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {contracts.map((c) => (
                <div key={c.id} className="flex-between gap-8">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-600 text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </div>
                    <div className="text-sm text-muted mt-4">{fmt(c.value)} / Jahr</div>
                  </div>
                  <StatusBadge value={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

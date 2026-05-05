import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Receipt, AlertCircle, TicketCheck, ArrowRight } from 'lucide-react';
import adminApi from '../../adminApi';
import StatusBadge, { PriorityBadge } from '../../components/StatusBadge';

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '-';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.get('/admin/dashboard').then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="loading-state"><div className="spinner" /> Daten werden geladen...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin-Dashboard</h1>
          <p className="page-subtitle">Gesamtübersicht aller Kundendaten</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><Users size={20} /></div>
          <div><div className="stat-value">{data.customers}</div><div className="stat-label">Kunden</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FileText size={20} /></div>
          <div><div className="stat-value">{data.activeContracts}</div><div className="stat-label">Aktive Verträge</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Receipt size={20} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: 18 }}>{fmt(data.openInvoicesTotal)}</div>
            <div className="stat-label">{data.openInvoices} offene Rechnungen</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertCircle size={20} /></div>
          <div><div className="stat-value">{data.overdueInvoices}</div><div className="stat-label">Überfällig</div></div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="stat-icon purple"><TicketCheck size={20} /></div>
          <div><div className="stat-value">{data.openTickets}</div><div className="stat-label">Offene Tickets</div></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <span className="card-title">Aktuelle Tickets</span>
            <Link to="/admin/tickets" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}>
              Alle anzeigen <ArrowRight size={13} />
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Betreff</th><th>Kunde</th><th>Priorität</th><th>Status</th><th>Datum</th></tr>
              </thead>
              <tbody>
                {data.recentTickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                    <td className="text-muted text-sm">{t.customer_name}</td>
                    <td><PriorityBadge value={t.priority} /></td>
                    <td><StatusBadge value={t.status} /></td>
                    <td className="text-muted text-sm">{fmtDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Neue Kunden</span>
            <Link to="/admin/kunden" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}>
              Alle <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recentCustomers.map((c) => (
              <div key={c.id} className="flex-between gap-8">
                <div>
                  <div className="fw-600 text-sm">{c.name}</div>
                  <div className="text-sm text-muted mt-4">{c.company || c.email}</div>
                </div>
                <span className="text-sm text-muted">{fmtDate(c.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

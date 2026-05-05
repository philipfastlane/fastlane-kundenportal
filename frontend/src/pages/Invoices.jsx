import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const fmt = (amount) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices').then((r) => {
      setInvoices(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" /> Rechnungen werden geladen...
      </div>
    );
  }

  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const totalOpen = invoices.filter((i) => i.status !== 'bezahlt').reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === 'überfällig').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rechnungen</h1>
          <p className="page-subtitle">{invoices.length} Rechnung{invoices.length !== 1 ? 'en' : ''} insgesamt</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 640, marginBottom: 20 }}>
        <div className="stat-card">
          <div><div className="stat-value" style={{ fontSize: 18 }}>{fmt(total)}</div><div className="stat-label">Gesamtvolumen</div></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-value" style={{ fontSize: 18, color: totalOpen > 0 ? 'var(--warning)' : undefined }}>{fmt(totalOpen)}</div><div className="stat-label">Offen / Ausstehend</div></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-value" style={{ color: overdue > 0 ? 'var(--danger)' : undefined }}>{overdue}</div><div className="stat-label">Überfällig</div></div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">Keine Rechnungen vorhanden</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rechnungsnummer</th>
                  <th>Bezeichnung</th>
                  <th>Betrag</th>
                  <th>Fällig am</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {inv.invoice_number}
                    </td>
                    <td>{inv.title}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(inv.amount)}</td>
                    <td style={{ color: inv.status === 'überfällig' ? 'var(--danger)' : undefined, fontWeight: inv.status === 'überfällig' ? 600 : undefined }}>
                      {fmtDate(inv.due_date)}
                    </td>
                    <td className="text-muted text-sm">{fmtDate(inv.created_at)}</td>
                    <td><StatusBadge value={inv.status} /></td>
                    <td>
                      {inv.pdf_path
                        ? <a href={inv.pdf_path} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><FileDown size={13} /> PDF</a>
                        : <span className="text-muted" style={{ fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { FileDown, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const fmt = (amount) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['alle', 'offen', 'bezahlt', 'überfällig', 'storniert'];

function exportCSV(invoices) {
  const headers = ['Rechnungsnummer', 'Bezeichnung', 'Betrag (EUR)', 'Fällig am', 'Erstellt am', 'Status'];
  const rows = invoices.map((inv) => [
    inv.invoice_number,
    inv.title,
    inv.amount.toFixed(2).replace('.', ','),
    fmtDate(inv.due_date),
    fmtDate(inv.created_at),
    inv.status,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rechnungen-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/invoices').then((r) => { setInvoices(r.data); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Rechnungen werden geladen...</div>;
  }

  const total      = invoices.reduce((s, i) => s + i.amount, 0);
  const totalOpen  = invoices.filter((i) => i.status !== 'bezahlt').reduce((s, i) => s + i.amount, 0);
  const overdue    = invoices.filter((i) => i.status === 'überfällig').length;

  const filtered = invoices.filter((inv) => {
    const matchStatus = statusFilter === 'alle' || inv.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.title.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rechnungen</h1>
          <p className="page-subtitle">{invoices.length} Rechnung{invoices.length !== 1 ? 'en' : ''} insgesamt</p>
        </div>
        {invoices.length > 0 && (
          <button className="btn btn-secondary" onClick={() => exportCSV(filtered)} style={{ fontSize: 13, gap: 6 }}>
            <Download size={15} /> CSV Export
          </button>
        )}
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
          <div className="empty-title">Noch keine Rechnungen</div>
          <div className="empty-text">Ihre Rechnungen werden hier angezeigt, sobald diese durch FastLane Solutions erstellt wurden.</div>
        </div>
      ) : (
        <>
          {/* Filter-Leiste */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 34, marginBottom: 0 }}
                placeholder="Suche nach Nr. oder Bezeichnung…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              />
            </div>
            <select
              className="form-select"
              style={{ flex: '0 0 160px', marginBottom: 0 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {paginated.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Keine Rechnungen gefunden.
              </div>
            ) : (
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
                    {paginated.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>{inv.invoice_number}</td>
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
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>{filtered.length} Ergebnisse · Seite {safePage} von {totalPages}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} style={{ padding: '6px 10px' }}>
                  <ChevronLeft size={16} />
                </button>
                <button className="btn btn-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ padding: '6px 10px' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { LogIn, Eye, TicketCheck, Filter } from 'lucide-react';
import adminApi from '../../adminApi';

const EVENT_ICONS = {
  login:          <LogIn size={14} />,
  invoice_viewed: <Eye size={14} />,
  ticket_created: <TicketCheck size={14} />,
};

const EVENT_LABELS = {
  login:          'Anmeldung',
  invoice_viewed: 'Rechnungen angesehen',
  ticket_created: 'Ticket erstellt',
};

const EVENT_COLORS = {
  login:          'var(--accent)',
  invoice_viewed: 'var(--info, #3b82f6)',
  ticket_created: 'var(--warning, #f59e0b)',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

const FILTERS = [
  ['', 'Alle'],
  ['login', 'Anmeldungen'],
  ['invoice_viewed', 'Rechnungen'],
  ['ticket_created', 'Tickets'],
];

export default function AdminActivities() {
  const [data, setData]       = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [page, setPage]       = useState(0);
  const PAGE_SIZE = 50;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    if (filter) params.set('type', filter);
    adminApi.get(`/admin/activities?${params}`).then((r) => {
      setData(r.data);
      setLoading(false);
    });
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const changeFilter = (f) => { setFilter(f); setPage(0); };

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Aktivitätsprotokoll</h1>
          <p className="page-subtitle">{data.total} Einträge gesamt</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-dim)' }} />
          {FILTERS.map(([v, l]) => (
            <button key={v} className={`btn ${filter === v ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => changeFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>Ereignis</th>
                <th>Kunde</th>
                <th>Beschreibung</th>
                <th>Zeitstempel</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : data.rows.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Keine Aktivitäten gefunden.</td></tr>
              ) : data.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${EVENT_COLORS[row.event_type] || 'var(--text-dim)'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: EVENT_COLORS[row.event_type] || 'var(--text-dim)' }}>
                      {EVENT_ICONS[row.event_type] || <Eye size={14} />}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600, color: EVENT_COLORS[row.event_type] || 'var(--text)' }}>
                      {EVENT_LABELS[row.event_type] || row.event_type}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{row.customer_name || '—'}</div>
                    <div className="text-sm text-muted">{row.customer_company || row.customer_email}</div>
                  </td>
                  <td className="text-sm text-muted">{row.description}</td>
                  <td className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>{fmtDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}
            disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Zurück</button>
          <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Seite {page + 1} von {totalPages}
          </span>
          <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}
            disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Weiter →</button>
        </div>
      )}
    </>
  );
}

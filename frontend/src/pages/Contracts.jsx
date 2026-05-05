import { useEffect, useState } from 'react';
import { FileText, Calendar, Euro, FileDown } from 'lucide-react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const fmt = (amount) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contracts').then((r) => {
      setContracts(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" /> Verträge werden geladen...
      </div>
    );
  }

  const active = contracts.filter((c) => c.status === 'aktiv').length;
  const totalValue = contracts
    .filter((c) => c.status === 'aktiv')
    .reduce((sum, c) => sum + c.value, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Verträge</h1>
          <p className="page-subtitle">{contracts.length} Vertrag{contracts.length !== 1 ? 'e' : ''} · {active} aktiv</p>
        </div>
      </div>

      {active > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 500, marginBottom: 20 }}>
          <div className="stat-card">
            <div><div className="stat-value">{active}</div><div className="stat-label">Aktive Verträge</div></div>
          </div>
          <div className="stat-card">
            <div><div className="stat-value" style={{ fontSize: 18 }}>{fmt(totalValue)}</div><div className="stat-label">Jahreswert aktiv</div></div>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">Keine Verträge vorhanden</div>
          <div className="empty-text">Kontaktieren Sie Ihren Ansprechpartner für weitere Informationen.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contracts.map((c) => (
            <div key={c.id} className="contract-item">
              <div className="contract-header">
                <div className="contract-title">
                  <FileText size={18} color="var(--accent)" />
                  {c.title}
                </div>
                <StatusBadge value={c.status} />
              </div>
              {c.description && <p className="contract-desc">{c.description}</p>}
              <div className="contract-meta">
                <div className="contract-meta-item">
                  <Calendar size={14} />
                  {fmtDate(c.start_date)} – {fmtDate(c.end_date)}
                </div>
                <div className="contract-meta-item">
                  <Euro size={14} />
                  {fmt(c.value)} / Jahr
                </div>
                {c.pdf_path && (
                  <a href={c.pdf_path} target="_blank" rel="noreferrer" className="contract-meta-item" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                    <FileDown size={14} />
                    Vertrag herunterladen
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

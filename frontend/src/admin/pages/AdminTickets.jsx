import { useEffect, useState } from 'react';
import { X, Send, ChevronDown } from 'lucide-react';
import adminApi from '../../adminApi';
import StatusBadge, { PriorityBadge } from '../../components/StatusBadge';

const fmtDate = (d) => d ? new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminTickets() {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [detail, setDetail]       = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [reply, setReply]         = useState('');
  const [sendingReply, setSending] = useState(false);
  const [updatingStatus, setUpdating] = useState(false);
  const [filter, setFilter]       = useState('all');

  const load = () => adminApi.get('/admin/tickets').then((r) => { setTickets(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openDetail = async (t) => {
    setDetail(t); setReply('');
    const { data } = await adminApi.get(`/admin/tickets/${t.id}`);
    setDetailData(data);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await adminApi.post(`/admin/tickets/${detail.id}/reply`, { message: reply });
      setReply('');
      const { data } = await adminApi.get(`/admin/tickets/${detail.id}`);
      setDetailData(data);
      load();
    } finally { setSending(false); }
  };

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await adminApi.put(`/admin/tickets/${detail.id}`, { status });
      const { data } = await adminApi.get(`/admin/tickets/${detail.id}`);
      setDetailData(data);
      setDetail(data);
      load();
    } finally { setUpdating(false); }
  };

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => {
    if (filter === 'open') return t.status !== 'gelöst' && t.status !== 'geschlossen';
    return t.status === filter;
  });

  if (loading) return <div className="loading-state"><div className="spinner" /> Wird geladen...</div>;

  const openCount = tickets.filter((t) => t.status !== 'gelöst' && t.status !== 'geschlossen').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support-Tickets</h1>
          <p className="page-subtitle">{tickets.length} Tickets · {openCount} offen</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all','Alle'],['open','Offen'],['in Bearbeitung','In Bearbeitung'],['gelöst','Gelöst']].map(([v,l]) => (
            <button key={v} className={`btn ${filter === v ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Betreff</th><th>Kunde</th><th>Priorität</th><th>Status</th><th>Erstellt</th><th></th></tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(t)}>
                  <td style={{ fontWeight: 600, maxWidth: 260 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div className="text-sm text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{t.description}</div>
                  </td>
                  <td>
                    <div className="text-sm" style={{ fontWeight: 500 }}>{t.customer_name}</div>
                    <div className="text-sm text-muted">{t.customer_company}</div>
                  </td>
                  <td><PriorityBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td className="text-sm text-muted">{fmtDate(t.created_at)}</td>
                  <td><ChevronDown size={16} style={{ color: 'var(--text-dim)', transform: 'rotate(-90deg)' }} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Keine Tickets gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 640, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: 16 }}>{detail.title}</h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <StatusBadge value={detailData?.status || detail.status} />
                  <PriorityBadge value={detail.priority} />
                  <span className="text-sm text-muted">{detail.customer_name} · {detail.customer_company}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetail(null)}><X size={20} /></button>
            </div>

            {/* Status buttons */}
            <div style={{ display: 'flex', gap: 8, padding: '0 0 16px', flexShrink: 0, flexWrap: 'wrap' }}>
              <span className="text-sm text-muted" style={{ alignSelf: 'center' }}>Status:</span>
              {['offen','in Bearbeitung','gelöst','geschlossen'].map((s) => (
                <button key={s}
                  className={`btn ${detailData?.status === s ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: 11 }}
                  onClick={() => handleStatusChange(s)} disabled={updatingStatus}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Original ticket */}
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '14px 16px', marginBottom: 12, flexShrink: 0 }}>
              <div className="text-sm text-muted" style={{ marginBottom: 6 }}>{fmtDate(detail.created_at)} · Kunde</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>{detail.description}</div>
            </div>

            {/* Replies */}
            {detailData?.replies && detailData.replies.length > 0 && (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {detailData.replies.map((r) => (
                  <div key={r.id} style={{ background: r.author_type === 'admin' ? 'rgba(168,204,48,0.08)' : 'var(--bg)', borderRadius: 8, padding: '12px 16px', border: `1px solid ${r.author_type === 'admin' ? 'var(--accent-border)' : 'var(--border)'}` }}>
                    <div className="text-sm text-muted" style={{ marginBottom: 5 }}>
                      {r.author_type === 'admin' ? `Admin (${r.author_name})` : 'Kunde'} · {fmtDate(r.created_at)}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7 }}>{r.message}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <form onSubmit={handleReply} style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea className="form-textarea" style={{ minHeight: 70, flex: 1, marginBottom: 0 }}
                  placeholder="Antwort schreiben..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleReply(e); }} />
                <button type="submit" className="btn btn-primary" disabled={sendingReply || !reply.trim()} style={{ height: 70, flexShrink: 0 }}>
                  <Send size={16} />
                </button>
              </div>
              <div className="text-sm text-muted" style={{ marginTop: 6 }}>Strg+Enter zum Senden</div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

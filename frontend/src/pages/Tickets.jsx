import { useEffect, useState, useRef } from 'react';
import { Plus, X, Send } from 'lucide-react';
import api from '../api';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const EMPTY_FORM = { title: '', description: '', priority: 'mittel' };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const repliesEndRef = useRef(null);

  const load = () => api.get('/tickets').then((r) => { setTickets(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setShowCreate(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/tickets', form);
      setShowCreate(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Ticket konnte nicht erstellt werden.');
    } finally { setSubmitting(false); }
  };

  const openDetail = async (ticket) => {
    setDetail({ ...ticket, replies: [] });
    setDetailLoading(true);
    setReplyText('');
    try {
      const { data } = await api.get(`/tickets/${ticket.id}`);
      setDetail(data);
    } finally { setDetailLoading(false); }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      const { data } = await api.post(`/tickets/${detail.id}/reply`, { message: replyText.trim() });
      setDetail(prev => ({ ...prev, replies: [...prev.replies, data] }));
      setReplyText('');
      setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } finally { setReplySending(false); }
  };

  const open = tickets.filter((t) => t.status !== 'gelöst' && t.status !== 'geschlossen').length;

  if (loading) return <div className="loading-state"><div className="spinner" /> Tickets werden geladen...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support-Tickets</h1>
          <p className="page-subtitle">{tickets.length} Ticket{tickets.length !== 1 ? 's' : ''} · {open} offen</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Neues Ticket</button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <div className="empty-title">Keine Tickets vorhanden</div>
          <div className="empty-text">Haben Sie ein technisches Problem? Erstellen Sie jetzt Ihr erstes Support-Ticket.</div>
          <button className="btn btn-primary" style={{ margin: '20px auto 0', display: 'flex' }} onClick={openCreate}>
            <Plus size={16} /> Ticket erstellen
          </button>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((t) => (
            <div key={t.id} className={`ticket-item prio-${t.priority}`} onClick={() => openDetail(t)} style={{ cursor: 'pointer' }}>
              <div>
                <div className="ticket-title">{t.title}</div>
                <div className="ticket-desc">{t.description}</div>
                <div className="ticket-meta">
                  <StatusBadge value={t.status} />
                  <PriorityBadge value={t.priority} />
                  <span className="ticket-date">{fmtDate(t.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket erstellen Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Neues Ticket erstellen</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            {formError && <div className="login-error" style={{ marginBottom: 16 }}>⚠ {formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Betreff *</label>
                <input className="form-input" placeholder="Kurze Beschreibung des Problems" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Beschreibung *</label>
                <textarea className="form-textarea" placeholder="Bitte beschreiben Sie Ihr Anliegen so detailliert wie möglich."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Priorität</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="niedrig">🟢 Niedrig – allgemeine Frage</option>
                  <option value="mittel">🟡 Mittel – Workaround möglich</option>
                  <option value="hoch">🔴 Hoch – kein Workaround möglich</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Wird erstellt...' : 'Ticket erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-wide" style={{ maxWidth: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div>
                <h2 className="modal-title">{detail.title}</h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <StatusBadge value={detail.status} />
                  <PriorityBadge value={detail.priority} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(detail.created_at)}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetail(null)}><X size={20} /></button>
            </div>

            <div style={{ padding: '0 28px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{detail.description}</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {detailLoading ? (
                <div className="loading-state" style={{ padding: 20 }}><div className="spinner" /></div>
              ) : detail.replies?.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  Noch keine Antworten. Unser Team meldet sich in Kürze.
                </p>
              ) : (
                detail.replies.map((r) => {
                  const isAdmin = r.author_type === 'admin';
                  return (
                    <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-start' : 'flex-end' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, paddingLeft: isAdmin ? 2 : 0, paddingRight: isAdmin ? 0 : 2 }}>
                        {isAdmin ? `${r.author_name} · FastLane Solutions` : 'Sie'} · {fmtDate(r.created_at)}
                      </div>
                      <div style={{
                        maxWidth: '80%', padding: '10px 14px', borderRadius: isAdmin ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                        background: isAdmin ? 'var(--bg)' : 'var(--accent)', color: isAdmin ? 'var(--text)' : '#141414',
                        fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        border: isAdmin ? '1px solid var(--border)' : 'none',
                      }}>
                        {r.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={repliesEndRef} />
            </div>

            {detail.status !== 'gelöst' && detail.status !== 'geschlossen' && (
              <form onSubmit={sendReply} style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 10 }}>
                <textarea
                  className="form-textarea"
                  style={{ flex: 1, minHeight: 64, resize: 'none', marginBottom: 0 }}
                  placeholder="Antwort schreiben..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply(e); }}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 16px' }} disabled={replySending || !replyText.trim()}>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

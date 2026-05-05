import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '-';

const EMPTY_FORM = { title: '', description: '', priority: 'mittel' };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    api.get('/tickets').then((r) => {
      setTickets(r.data);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const openModal = () => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/tickets', form);
      closeModal();
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Ticket konnte nicht erstellt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  const open = tickets.filter((t) => t.status !== 'gelöst' && t.status !== 'geschlossen').length;

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" /> Tickets werden geladen...
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support-Tickets</h1>
          <p className="page-subtitle">
            {tickets.length} Ticket{tickets.length !== 1 ? 's' : ''} · {open} offen
          </p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Neues Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <div className="empty-title">Keine Tickets vorhanden</div>
          <div className="empty-text">
            Haben Sie ein technisches Problem? Erstellen Sie jetzt Ihr erstes Support-Ticket.
          </div>
          <button className="btn btn-primary" style={{ margin: '20px auto 0', display: 'flex' }} onClick={openModal}>
            <Plus size={16} /> Ticket erstellen
          </button>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((t) => (
            <div key={t.id} className={`ticket-item prio-${t.priority}`}>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Neues Ticket erstellen</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Schließen">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="login-error" style={{ marginBottom: 16 }}>⚠ {formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Betreff *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="Kurze Beschreibung des Problems"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Beschreibung *</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Bitte beschreiben Sie Ihr Anliegen so detailliert wie möglich – inkl. Fehlermeldungen, betroffene Funktion und Schritte zur Reproduktion."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priorität</label>
                <select
                  id="priority"
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="niedrig">🟢 Niedrig – allgemeine Frage, kein Handlungsbedarf</option>
                  <option value="mittel">🟡 Mittel – beeinträchtigt die Arbeit, Workaround möglich</option>
                  <option value="hoch">🔴 Hoch – kritisches Problem, kein Workaround möglich</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Wird erstellt...' : 'Ticket erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

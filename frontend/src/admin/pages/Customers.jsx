import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Copy, Check, Mail } from 'lucide-react';
import adminApi from '../../adminApi';

const EMPTY = { name: '', email: '', company: '', password: '' };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '-';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // null | 'create' | customer-obj
  const [form, setForm]           = useState(EMPTY);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [credentials, setCredentials] = useState(null); // { email, password, name }
  const [copied, setCopied]           = useState('');

  const load = () => adminApi.get('/admin/customers').then((r) => { setCustomers(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit   = (c)  => { setForm({ name: c.name, email: c.email, company: c.company || '', password: '' }); setError(''); setModal(c); };
  const closeModal = ()   => setModal(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (modal === 'create') {
        const { data } = await adminApi.post('/admin/customers', form);
        closeModal();
        load();
        setCredentials({ name: data.name, email: data.email, password: data.generatedPassword });
      } else {
        await adminApi.put(`/admin/customers/${modal.id}`, form);
        closeModal(); load();
      }
    } catch (err) { setError(err.response?.data?.error || 'Fehler beim Speichern'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await adminApi.delete(`/admin/customers/${delTarget.id}`); setDelTarget(null); load(); }
    catch (err) { alert(err.response?.data?.error || 'Löschen fehlgeschlagen'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading-state"><div className="spinner" /> Wird geladen...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kunden</h1>
          <p className="page-subtitle">{customers.length} Kunden registriert</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Neuer Kunde</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Name</th><th>Firma</th><th>E-Mail</th>
              <th>Verträge</th><th>Rechnungen</th><th>Tickets</th>
              <th>Seit</th><th></th>
            </tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="text-muted text-sm">{c.company || '—'}</td>
                  <td className="text-sm">{c.email}</td>
                  <td><span className="badge badge-gray">{c.contract_count}</span></td>
                  <td>{c.open_invoices > 0 ? <span className="badge badge-yellow">{c.open_invoices} offen</span> : <span className="badge badge-green">0</span>}</td>
                  <td>{c.open_tickets > 0 ? <span className="badge badge-red">{c.open_tickets} offen</span> : <span className="badge badge-gray">0</span>}</td>
                  <td className="text-sm text-muted">{fmtDate(c.created_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => openEdit(c)} title="Bearbeiten"><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => setDelTarget(c)} title="Löschen"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'Neuer Kunde' : 'Kunde bearbeiten'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={f('name')} placeholder="Max Mustermann" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Firma</label>
                  <input className="form-input" value={form.company} onChange={f('company')} placeholder="Mustermann GmbH" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">E-Mail *</label>
                  <input type="email" className="form-input" value={form.email} onChange={f('email')} placeholder="max@firma.de" required />
                </div>
                {modal !== 'create' && (
                  <div className="form-group">
                    <label className="form-label">Neues Passwort (optional)</label>
                    <input type="password" className="form-input" value={form.password} onChange={f('password')} placeholder="••••••••" />
                  </div>
                )}
              </div>
              {modal === 'create' && (
                <div style={{ background: 'rgba(168,204,48,0.08)', border: '1px solid var(--accent-border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={14} style={{ flexShrink: 0, color: 'var(--accent)' }} />
                  Ein sicheres Einmalpasswort wird automatisch generiert und dem Kunden per E-Mail zugestellt.
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Wird erstellt...' : (modal === 'create' ? 'Kunde anlegen' : 'Speichern')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {credentials && (
        <div className="modal-overlay" onClick={() => setCredentials(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={18} style={{ color: 'var(--accent)' }} /> Kunde angelegt
              </h2>
              <button className="modal-close" onClick={() => setCredentials(null)}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong>{credentials.name}</strong> wurde erfolgreich angelegt. Die Willkommens-E-Mail mit den Zugangsdaten wurde versendet.
            </p>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>E-Mail</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 14 }}>{credentials.email}</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => copyToClipboard(credentials.email, 'email')}>
                    {copied === 'email' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Einmalpasswort</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>{credentials.password}</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => copyToClipboard(credentials.password, 'pwd')}>
                    {copied === 'pwd' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 12, marginTop: 4 }}
                onClick={() => copyToClipboard(`E-Mail: ${credentials.email}\nPasswort: ${credentials.password}`, 'all')}>
                {copied === 'all' ? <><Check size={13} /> Kopiert!</> : <><Copy size={13} /> Beide Felder kopieren</>}
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', background: 'var(--bg)', borderRadius: 6, padding: '8px 12px' }}>
              Dieses Passwort wird nur einmalig angezeigt. Bitte teilen Sie es sicher mit dem Kunden.
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => setCredentials(null)}>Verstanden</button>
            </div>
          </div>
        </div>
      )}

      {delTarget && (
        <div className="modal-overlay" onClick={() => setDelTarget(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Kunde löschen</h2>
              <button className="modal-close" onClick={() => setDelTarget(null)}><X size={20} /></button>
            </div>
            <p className="confirm-text">
              Möchten Sie <strong>{delTarget.name}</strong> wirklich löschen?
              Alle zugehörigen Verträge, Rechnungen und Tickets werden ebenfalls gelöscht.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDelTarget(null)}>Abbrechen</button>
              <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={handleDelete}>Endgültig löschen</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

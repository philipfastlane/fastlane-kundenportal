import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import adminApi from '../../adminApi';

const EMPTY = { customer_id: '', name: '', position: '', email: '', phone: '', department: '' };

function initials(name) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminContacts() {
  const [contacts, setContacts]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const load = () => Promise.all([
    adminApi.get('/admin/contacts'),
    adminApi.get('/admin/customers'),
  ]).then(([co, cu]) => { setContacts(co.data); setCustomers(cu.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit   = (c) => {
    setForm({ customer_id: c.customer_id, name: c.name, position: c.position || '', email: c.email || '', phone: c.phone || '', department: c.department || '' });
    setError(''); setModal(c);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (modal === 'create') await adminApi.post('/admin/contacts', form);
      else await adminApi.put(`/admin/contacts/${modal.id}`, form);
      setModal(null); load();
    } catch (err) { setError(err.response?.data?.error || 'Fehler'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await adminApi.delete(`/admin/contacts/${delTarget.id}`); setDelTarget(null); load(); }
    catch { alert('Löschen fehlgeschlagen'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading-state"><div className="spinner" /> Wird geladen...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ansprechpartner</h1>
          <p className="page-subtitle">{contacts.length} Einträge</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Neuer Ansprechpartner</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Kunde</th><th>Position</th><th>Abteilung</th><th>Kontakt</th><th></th></tr></thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        {initials(c.name)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm" style={{ fontWeight: 500 }}>{c.customer_name}</div>
                    <div className="text-sm text-muted">{c.customer_company}</div>
                  </td>
                  <td className="text-sm">{c.position || '—'}</td>
                  <td>{c.department ? <span className="badge badge-gray">{c.department}</span> : '—'}</td>
                  <td className="text-sm text-muted">
                    {c.email && <div>{c.email}</div>}
                    {c.phone && <div>{c.phone}</div>}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => setDelTarget(c)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'Neuer Ansprechpartner' : 'Ansprechpartner bearbeiten'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Kunde *</label>
                <select className="form-select" value={form.customer_id} onChange={f('customer_id')} required>
                  <option value="">Kunde wählen...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} – {c.company || c.email}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={f('name')} placeholder="Anna Schmidt" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input className="form-input" value={form.position} onChange={f('position')} placeholder="Key Account Managerin" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">E-Mail</label>
                  <input type="email" className="form-input" value={form.email} onChange={f('email')} placeholder="a.schmidt@firma.de" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" value={form.phone} onChange={f('phone')} placeholder="+49 89 123456-10" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Abteilung</label>
                <input className="form-input" value={form.department} onChange={f('department')} placeholder="Vertrieb" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {delTarget && (
        <div className="modal-overlay" onClick={() => setDelTarget(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Ansprechpartner löschen</h2>
              <button className="modal-close" onClick={() => setDelTarget(null)}><X size={20} /></button>
            </div>
            <p className="confirm-text"><strong>{delTarget.name}</strong> wirklich löschen?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDelTarget(null)}>Abbrechen</button>
              <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={handleDelete}>Löschen</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, FileDown } from 'lucide-react';
import adminApi from '../../adminApi';
import StatusBadge from '../../components/StatusBadge';

const EMPTY = { customer_id: '', title: '', description: '', start_date: '', end_date: '', status: 'aktiv', value: '' };
const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '—';

export default function AdminContracts() {
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [pdfFile, setPdfFile]     = useState(null);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const fileRef = useRef();

  const load = () => Promise.all([
    adminApi.get('/admin/contracts'),
    adminApi.get('/admin/customers'),
  ]).then(([c, cu]) => { setContracts(c.data); setCustomers(cu.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setPdfFile(null); setError(''); setModal('create'); };
  const openEdit   = (c) => {
    setForm({ customer_id: c.customer_id, title: c.title, description: c.description || '', start_date: c.start_date || '', end_date: c.end_date || '', status: c.status, value: c.value });
    setPdfFile(null); setError(''); setModal(c);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (pdfFile) fd.append('pdf', pdfFile);
      if (modal === 'create') await adminApi.post('/admin/contracts', fd);
      else await adminApi.put(`/admin/contracts/${modal.id}`, fd);
      setModal(null); load();
    } catch (err) { setError(err.response?.data?.error || 'Fehler'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await adminApi.delete(`/admin/contracts/${delTarget.id}`); setDelTarget(null); load(); }
    catch { alert('Löschen fehlgeschlagen'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading-state"><div className="spinner" /> Wird geladen...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Verträge</h1>
          <p className="page-subtitle">{contracts.length} Verträge gesamt</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Neuer Vertrag</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Kunde</th><th>Titel</th><th>Status</th><th>Wert/Jahr</th><th>Laufzeit</th><th>PDF</th><th></th></tr></thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.customer_name}</div>
                    <div className="text-sm text-muted">{c.customer_company}</div>
                  </td>
                  <td style={{ maxWidth: 200 }}>{c.title}</td>
                  <td><StatusBadge value={c.status} /></td>
                  <td style={{ fontWeight: 600 }}>{fmt(c.value)}</td>
                  <td className="text-sm text-muted">{fmtDate(c.start_date)} – {fmtDate(c.end_date)}</td>
                  <td>
                    {c.pdf_path
                      ? <a href={c.pdf_path} target="_blank" rel="noreferrer" className="btn-icon" title="PDF herunterladen"><FileDown size={14} /></a>
                      : <span className="text-dim text-sm">—</span>}
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
              <h2 className="modal-title">{modal === 'create' ? 'Neuer Vertrag' : 'Vertrag bearbeiten'}</h2>
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
              <div className="form-group">
                <label className="form-label">Titel *</label>
                <input className="form-input" value={form.title} onChange={f('title')} placeholder="Wartungsvertrag Premium" required />
              </div>
              <div className="form-group">
                <label className="form-label">Beschreibung</label>
                <textarea className="form-textarea" value={form.description} onChange={f('description')} placeholder="Leistungsbeschreibung..." style={{ minHeight: 80 }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Startdatum</label>
                  <input type="date" className="form-input" value={form.start_date} onChange={f('start_date')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Enddatum</label>
                  <input type="date" className="form-input" value={form.end_date} onChange={f('end_date')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    <option value="aktiv">Aktiv</option>
                    <option value="abgelaufen">Abgelaufen</option>
                    <option value="gekündigt">Gekündigt</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jahreswert (€)</label>
                  <input type="number" className="form-input" value={form.value} onChange={f('value')} placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">PDF-Vertrag {modal !== 'create' && modal?.pdf_path ? '(aktuell vorhanden – neu hochladen zum Ersetzen)' : '(optional)'}</label>
                <input ref={fileRef} type="file" accept=".pdf" className="form-input" style={{ padding: '7px 14px', cursor: 'pointer' }}
                  onChange={(e) => setPdfFile(e.target.files[0])} />
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
              <h2 className="modal-title">Vertrag löschen</h2>
              <button className="modal-close" onClick={() => setDelTarget(null)}><X size={20} /></button>
            </div>
            <p className="confirm-text">Vertrag <strong>„{delTarget.title}"</strong> von <strong>{delTarget.customer_name}</strong> wirklich löschen?</p>
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

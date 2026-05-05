import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, FileDown } from 'lucide-react';
import adminApi from '../../adminApi';
import StatusBadge from '../../components/StatusBadge';

const EMPTY = { customer_id: '', invoice_number: '', title: '', amount: '', status: 'offen', due_date: '' };
const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '—';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [modal, setModal]        = useState(null);
  const [form, setForm]          = useState(EMPTY);
  const [pdfFile, setPdfFile]    = useState(null);
  const [error, setError]        = useState('');
  const [saving, setSaving]      = useState(false);
  const [delTarget, setDelTarget]= useState(null);
  const fileRef = useRef();

  const load = () => Promise.all([
    adminApi.get('/admin/invoices'),
    adminApi.get('/admin/customers'),
  ]).then(([i, c]) => { setInvoices(i.data); setCustomers(c.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setPdfFile(null); setError(''); setModal('create'); };
  const openEdit   = (inv) => {
    setForm({ customer_id: inv.customer_id, invoice_number: inv.invoice_number, title: inv.title, amount: inv.amount, status: inv.status, due_date: inv.due_date || '' });
    setPdfFile(null); setError(''); setModal(inv);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (pdfFile) fd.append('pdf', pdfFile);
      if (modal === 'create') await adminApi.post('/admin/invoices', fd);
      else await adminApi.put(`/admin/invoices/${modal.id}`, fd);
      setModal(null); load();
    } catch (err) { setError(err.response?.data?.error || 'Fehler beim Speichern'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await adminApi.delete(`/admin/invoices/${delTarget.id}`); setDelTarget(null); load(); }
    catch { alert('Löschen fehlgeschlagen'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading-state"><div className="spinner" /> Wird geladen...</div>;

  const totalOpen = invoices.filter((i) => i.status !== 'bezahlt').reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rechnungen</h1>
          <p className="page-subtitle">{invoices.length} Rechnungen · {fmt(totalOpen)} offen</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Neue Rechnung</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Kunde</th><th>Rechnungsnr.</th><th>Bezeichnung</th><th>Betrag</th><th>Fällig</th><th>Status</th><th>PDF</th><th></th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.customer_name}</div>
                    <div className="text-sm text-muted">{inv.customer_company}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>{inv.invoice_number}</td>
                  <td className="text-sm">{inv.title}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(inv.amount)}</td>
                  <td className="text-sm text-muted" style={{ color: inv.status === 'überfällig' ? 'var(--s-red-txt)' : undefined }}>{fmtDate(inv.due_date)}</td>
                  <td><StatusBadge value={inv.status} /></td>
                  <td>
                    {inv.pdf_path
                      ? <a href={inv.pdf_path} target="_blank" rel="noreferrer" className="btn-icon" title="PDF herunterladen"><FileDown size={14} /></a>
                      : <span className="text-dim text-sm">—</span>}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => openEdit(inv)}><Pencil size={14} /></button>
                      <button className="btn-icon danger" onClick={() => setDelTarget(inv)}><Trash2 size={14} /></button>
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
              <h2 className="modal-title">{modal === 'create' ? 'Neue Rechnung' : 'Rechnung bearbeiten'}</h2>
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
                  <label className="form-label">Rechnungsnummer *</label>
                  <input className="form-input" value={form.invoice_number} onChange={f('invoice_number')} placeholder="RE-2024-001" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Betrag (€) *</label>
                  <input type="number" className="form-input" value={form.amount} onChange={f('amount')} placeholder="0.00" step="0.01" min="0" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bezeichnung *</label>
                <input className="form-input" value={form.title} onChange={f('title')} placeholder="Wartungsvertrag Q1 2024" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fälligkeitsdatum</label>
                  <input type="date" className="form-input" value={form.due_date} onChange={f('due_date')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    <option value="offen">Offen</option>
                    <option value="bezahlt">Bezahlt</option>
                    <option value="überfällig">Überfällig</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">PDF-Rechnung {modal !== 'create' && modal?.pdf_path ? '(aktuell vorhanden – neu hochladen zum Ersetzen)' : '(optional)'}</label>
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
              <h2 className="modal-title">Rechnung löschen</h2>
              <button className="modal-close" onClick={() => setDelTarget(null)}><X size={20} /></button>
            </div>
            <p className="confirm-text">Rechnung <strong>{delTarget.invoice_number}</strong> von <strong>{delTarget.customer_name}</strong> wirklich löschen?{delTarget.pdf_path && ' Die PDF-Datei wird ebenfalls gelöscht.'}</p>
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

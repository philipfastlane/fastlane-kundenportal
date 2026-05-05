const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');
const { sendNewInvoiceEmail } = require('../../mailer');

const router = express.Router();
router.use(adminAuth);

const uploadDir = path.join(__dirname, '../../uploads/invoices');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Nur PDF-Dateien erlaubt'));
  },
});

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT i.*, c.name as customer_name, c.company as customer_company
    FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.created_at DESC
  `).all());
});

router.post('/', upload.single('pdf'), (req, res) => {
  const { customer_id, invoice_number, title, amount, status, due_date } = req.body;
  if (!customer_id || !invoice_number?.trim() || !title?.trim() || !amount) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen (Kunde, Rechnungsnr., Bezeichnung, Betrag)' });
  }
  const pdf_path = req.file ? `/uploads/invoices/${req.file.filename}` : null;
  const r = db.prepare(
    'INSERT INTO invoices (customer_id, invoice_number, title, amount, status, due_date, pdf_path) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(customer_id, invoice_number.trim(), title.trim(), parseFloat(amount), status || 'offen', due_date || null, pdf_path);
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(r.lastInsertRowid);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
  if (customer) sendNewInvoiceEmail(customer, invoice).catch((err) => console.error('Rechnungs-E-Mail Fehler:', err.message));

  res.status(201).json(invoice);
});

router.put('/:id', upload.single('pdf'), (req, res) => {
  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Rechnung nicht gefunden' });
  const { customer_id, invoice_number, title, amount, status, due_date } = req.body;
  const pdf_path = req.file ? `/uploads/invoices/${req.file.filename}` : inv.pdf_path;
  if (req.file && inv.pdf_path) {
    const old = path.join(__dirname, '../../', inv.pdf_path);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  db.prepare(`
    UPDATE invoices SET
      customer_id    = COALESCE(?, customer_id),
      invoice_number = COALESCE(?, invoice_number),
      title          = COALESCE(?, title),
      amount         = COALESCE(?, amount),
      status         = COALESCE(?, status),
      due_date       = ?,
      pdf_path       = ?
    WHERE id = ?
  `).run(customer_id || null, invoice_number?.trim() || null, title?.trim() || null, parseFloat(amount) || null, status || null, due_date || null, pdf_path, req.params.id);
  res.json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Rechnung nicht gefunden' });
  if (inv.pdf_path) {
    const p = path.join(__dirname, '../../', inv.pdf_path);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

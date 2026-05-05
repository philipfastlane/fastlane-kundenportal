const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');
const { sendNewContractEmail } = require('../../mailer');

const router = express.Router();
router.use(adminAuth);

const uploadDir = path.join(process.env.UPLOADS_PATH || path.join(__dirname, '../../uploads'), 'contracts');
fs.mkdirSync(uploadDir, { recursive: true });

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
    SELECT c.*, cu.name as customer_name, cu.company as customer_company
    FROM contracts c LEFT JOIN customers cu ON c.customer_id = cu.id
    ORDER BY c.id DESC
  `).all());
});

router.post('/', upload.single('pdf'), (req, res) => {
  const { customer_id, title, description, start_date, end_date, status, value } = req.body;
  if (!customer_id || !title?.trim()) return res.status(400).json({ error: 'Kunde und Titel sind erforderlich' });
  const pdf_path = req.file ? `/uploads/contracts/${req.file.filename}` : null;
  const r = db.prepare(
    'INSERT INTO contracts (customer_id, title, description, start_date, end_date, status, value, pdf_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(customer_id, title.trim(), description?.trim() || null, start_date || null, end_date || null, status || 'aktiv', parseFloat(value) || 0, pdf_path);
  const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(r.lastInsertRowid);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
  if (customer) sendNewContractEmail(customer, contract).catch((err) => console.error('Vertrags-E-Mail Fehler:', err.message));

  res.status(201).json(contract);
});

router.put('/:id', upload.single('pdf'), (req, res) => {
  const existing = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Vertrag nicht gefunden' });
  const { customer_id, title, description, start_date, end_date, status, value } = req.body;
  const pdf_path = req.file ? `/uploads/contracts/${req.file.filename}` : existing.pdf_path;
  if (req.file && existing.pdf_path) {
    const old = path.join(__dirname, '../../', existing.pdf_path);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  db.prepare(`
    UPDATE contracts SET
      customer_id = COALESCE(?, customer_id),
      title       = COALESCE(?, title),
      description = ?,
      start_date  = ?,
      end_date    = ?,
      status      = COALESCE(?, status),
      value       = COALESCE(?, value),
      pdf_path    = ?
    WHERE id = ?
  `).run(customer_id || null, title?.trim() || null, description?.trim() || null, start_date || null, end_date || null, status || null, parseFloat(value) || null, pdf_path, req.params.id);
  res.json(db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Vertrag nicht gefunden' });
  if (existing.pdf_path) {
    const p = path.join(__dirname, '../../', existing.pdf_path);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('DELETE FROM contracts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

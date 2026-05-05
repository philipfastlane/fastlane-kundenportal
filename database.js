const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'kundenportal.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'aktiv',
    value REAL DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    department TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    invoice_number TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'offen',
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'offen',
    priority TEXT DEFAULT 'mittel',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );
`);

// New tables (safe to run on existing DB)
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ticket_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    author_type TEXT DEFAULT 'admin',
    author_name TEXT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
  );
`);

// Safe schema migrations
try { db.exec('ALTER TABLE invoices ADD COLUMN pdf_path TEXT'); } catch (_) {}
try { db.exec('ALTER TABLE contracts ADD COLUMN pdf_path TEXT'); } catch (_) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    token      TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used       INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    event_type  TEXT NOT NULL,
    description TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );
`);

// Seed admin user
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
if (adminCount.count === 0) {
  const adminHash = bcrypt.hashSync('FastLane2024!', 10);
  db.prepare('INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)').run('Administrator', 'admin@fastlane.de', adminHash);
  console.log('Admin erstellt: admin@fastlane.de / FastLane2024!');
}

const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
if (customerCount.count === 0) {
  const passwordHash = bcrypt.hashSync('demo123', 10);
  const customer = db.prepare(
    'INSERT INTO customers (name, email, password_hash, company) VALUES (?, ?, ?, ?)'
  ).run('Max Mustermann', 'max@mustermann.de', passwordHash, 'Mustermann GmbH');
  const cid = customer.lastInsertRowid;

  const addContract = db.prepare(
    'INSERT INTO contracts (customer_id, title, description, start_date, end_date, status, value) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  addContract.run(cid, 'Wartungsvertrag Premium', 'Vollwartung aller Systeme inkl. 24/7 Support und Reaktionszeit < 4 Stunden.', '2024-01-01', '2024-12-31', 'aktiv', 2400.00);
  addContract.run(cid, 'Software-Lizenz Enterprise', 'Jahres-Lizenz für die Enterprise Suite inkl. aller Module und Updates.', '2024-01-01', '2024-12-31', 'aktiv', 5000.00);
  addContract.run(cid, 'Schulungspaket Basic', 'Onboarding und Schulungen für bis zu 10 Mitarbeiter, inkl. Schulungsunterlagen.', '2023-06-01', '2023-12-31', 'abgelaufen', 1500.00);

  const addContact = db.prepare(
    'INSERT INTO contacts (customer_id, name, position, email, phone, department) VALUES (?, ?, ?, ?, ?, ?)'
  );
  addContact.run(cid, 'Anna Schmidt', 'Key Account Managerin', 'a.schmidt@anbieter.de', '+49 89 123456-10', 'Vertrieb');
  addContact.run(cid, 'Thomas Müller', 'Technischer Support', 't.mueller@anbieter.de', '+49 89 123456-20', 'Support');
  addContact.run(cid, 'Laura Weber', 'Buchhaltung', 'l.weber@anbieter.de', '+49 89 123456-30', 'Buchhaltung');

  const addInvoice = db.prepare(
    'INSERT INTO invoices (customer_id, invoice_number, title, amount, status, due_date) VALUES (?, ?, ?, ?, ?, ?)'
  );
  addInvoice.run(cid, 'RE-2024-001', 'Wartungsvertrag Q1 2024', 600.00, 'bezahlt', '2024-01-31');
  addInvoice.run(cid, 'RE-2024-002', 'Software-Lizenz Jahresgebühr 2024', 5000.00, 'bezahlt', '2024-02-15');
  addInvoice.run(cid, 'RE-2024-003', 'Wartungsvertrag Q2 2024', 600.00, 'offen', '2024-04-30');
  addInvoice.run(cid, 'RE-2024-004', 'Sonderleistung: System-Migration', 1200.00, 'überfällig', '2024-03-15');

  const addTicket = db.prepare(
    'INSERT INTO tickets (customer_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)'
  );
  addTicket.run(cid, 'Login-Problem nach Update', 'Seit dem letzten System-Update kann ich mich nicht mehr mit meinem alten Passwort einloggen. Die Fehlermeldung lautet: "Ungültige Zugangsdaten".', 'in Bearbeitung', 'hoch');
  addTicket.run(cid, 'PDF-Export funktioniert nicht', 'Der PDF-Export im Reporting-Modul produziert eine leere Datei. Das Problem besteht seit Version 3.2.1.', 'offen', 'mittel');
  addTicket.run(cid, 'Frage zur REST-API-Dokumentation', 'Wo finde ich die aktuelle API-Dokumentation für die REST-Schnittstelle? Der Link in der E-Mail vom letzten Monat führt zu einem 404-Fehler.', 'gelöst', 'niedrig');

  console.log('Demo-Daten erstellt. Login: max@mustermann.de / demo123');
}

module.exports = db;

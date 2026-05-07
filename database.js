const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'kundenportal.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
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
try { db.exec('ALTER TABLE customers ADD COLUMN must_change_password INTEGER DEFAULT 0'); } catch (_) {}
try { db.exec('ALTER TABLE customers ADD COLUMN last_login TEXT'); } catch (_) {}
try { db.exec('ALTER TABLE customers ADD COLUMN two_fa_enabled INTEGER DEFAULT 0'); } catch (_) {}

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

  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    message     TEXT,
    read        INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS login_otp (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    code        TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    used        INTEGER DEFAULT 0,
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


module.exports = db;

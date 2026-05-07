require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

require('./database');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// In development allow Vite dev server; in production same-origin
app.use(cors({
  origin: isProd
    ? false
    : ['http://localhost:5173', 'http://localhost:4173'],
}));

app.use(helmet());
app.use(express.json());

// Rate limiter for login endpoints: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.' },
});

// Rate limiter for password reset: max 5 requests per hour per IP
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte warten Sie eine Stunde.' },
});

// General limiter: 300 requests per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
});
app.use('/api/', generalLimiter);

app.use('/api/auth/login', loginLimiter);
app.use('/api/admin/auth/login', loginLimiter);
app.use('/api/auth/verify-2fa', loginLimiter);
app.use('/api/auth/forgot-password', resetLimiter);

// Uploaded PDFs / contract files
const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Customer-facing routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/profile',       require('./routes/profile'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/contacts',  require('./routes/contacts'));
app.use('/api/invoices',  require('./routes/invoices'));
app.use('/api/tickets',   require('./routes/tickets'));

// Admin routes
app.use('/api/admin/auth',         require('./routes/admin/auth'));
app.use('/api/admin/dashboard',    require('./routes/admin/dashboard'));
app.use('/api/admin/customers',    require('./routes/admin/customers'));
app.use('/api/admin/contracts',    require('./routes/admin/contracts'));
app.use('/api/admin/invoices',     require('./routes/admin/invoices'));
app.use('/api/admin/contacts',     require('./routes/admin/contacts'));
app.use('/api/admin/tickets',      require('./routes/admin/tickets'));
app.use('/api/admin/activities',   require('./routes/admin/activities'));

// Serve built frontend in production
const distDir = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distDir, 'index.html'));
    } else {
      next();
    }
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`FastLane-Server läuft auf Port ${PORT}`);
  if (!isProd) {
    console.log('Kunde:  max@mustermann.de / demo123');
    console.log('Admin:  admin@fastlane.de / FastLane2024!');
  }
});

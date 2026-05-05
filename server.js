require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('./database');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// In development allow Vite dev server; in production same-origin
app.use(cors({
  origin: isProd
    ? false
    : ['http://localhost:5173', 'http://localhost:4173'],
}));

app.use(express.json());

// Uploaded PDFs / contract files
const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Customer-facing routes
app.use('/api/auth',      require('./routes/auth'));
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

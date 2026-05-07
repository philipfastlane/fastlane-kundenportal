const jwt = require('jsonwebtoken');
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET;
if (!ADMIN_SECRET) { console.error('FATAL: ADMIN_JWT_SECRET nicht gesetzt'); process.exit(1); }

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });
  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Kein Admin-Zugriff' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
  }
};

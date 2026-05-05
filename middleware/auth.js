const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kundenportal-geheimschluessel-2024';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
  }
};

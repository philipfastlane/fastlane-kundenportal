function validatePasswordStrength(password) {
  if (!password || password.length < 8) return 'Mindestens 8 Zeichen erforderlich';
  if (!/[A-Z]/.test(password)) return 'Mindestens ein Großbuchstabe erforderlich (A–Z)';
  if (!/[0-9]/.test(password)) return 'Mindestens eine Zahl erforderlich (0–9)';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Mindestens ein Sonderzeichen erforderlich (!@#$%...)';
  return null;
}

module.exports = { validatePasswordStrength };

const STATUS_MAP = {
  // Verträge
  aktiv:          ['badge-green',  'Aktiv'],
  abgelaufen:     ['badge-gray',   'Abgelaufen'],
  'gekündigt':    ['badge-red',    'Gekündigt'],
  // Rechnungen
  bezahlt:        ['badge-green',  'Bezahlt'],
  offen:          ['badge-yellow', 'Offen'],
  'überfällig':   ['badge-red',    'Überfällig'],
  // Tickets
  'in Bearbeitung': ['badge-blue', 'In Bearbeitung'],
  gelöst:         ['badge-green',  'Gelöst'],
  geschlossen:    ['badge-gray',   'Geschlossen'],
};

export default function StatusBadge({ value }) {
  const [cls, label] = STATUS_MAP[value] || ['badge-gray', value];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function PriorityBadge({ value }) {
  const map = {
    hoch:    ['badge-red',    'Hoch'],
    mittel:  ['badge-yellow', 'Mittel'],
    niedrig: ['badge-green',  'Niedrig'],
  };
  const [cls, label] = map[value] || ['badge-gray', value];
  return <span className={`badge ${cls}`}>{label}</span>;
}

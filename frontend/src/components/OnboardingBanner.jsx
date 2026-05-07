import { useState } from 'react';
import { FileText, Receipt, TicketCheck, X, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'portal_onboarded';

const steps = [
  { icon: FileText,    color: 'var(--accent)', title: 'Verträge',        desc: 'Alle Ihre aktiven Verträge und Dokumente auf einen Blick.' },
  { icon: Receipt,     color: '#ed8936',        title: 'Rechnungen',      desc: 'Offene und bezahlte Rechnungen – mit PDF-Download und Exportfunktion.' },
  { icon: TicketCheck, color: '#63b3ed',        title: 'Support-Tickets', desc: 'Erstellen Sie Tickets und kommunizieren Sie direkt mit unserem Team.' },
];

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--card) 0%, rgba(168,204,48,0.06) 100%)',
      border: '1px solid rgba(168,204,48,0.25)',
      borderRadius: 14,
      padding: '24px 28px',
      marginBottom: 28,
      position: 'relative',
    }}>
      <button
        onClick={dismiss}
        style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
        aria-label="Schließen"
      >
        <X size={18} />
      </button>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Willkommen im FastLane Kundenportal
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Hier haben Sie jederzeit Zugriff auf alle wichtigen Informationen zu Ihrer Geschäftsbeziehung.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
        {steps.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <Icon size={20} color={color} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      <button onClick={dismiss} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>
        Verstanden, loslegen <ArrowRight size={14} />
      </button>
    </div>
  );
}

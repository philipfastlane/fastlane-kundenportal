import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Datenschutz() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Zurück
        </Link>

        <div className="card">
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Datenschutzerklärung</h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 28 }}>Stand: April 2026</p>

          {[
            {
              title: 'Verantwortlicher',
              text: 'Philip Köhler, Trift 18, 29308 Winsen (Aller)\nKontakt: philip@fastlanesolutions.de · 0151 / 2189 6391',
            },
            {
              title: 'Grundsätze der Datenverarbeitung',
              text: 'Diese Anwendung verarbeitet personenbezogene Daten gemäß der DSGVO und dem deutschen Datenschutzrecht. Die Erhebung beschränkt sich auf technisch notwendige Informationen. Rechtsgrundlage ist Art. 6 Abs. 1 DSGVO.',
            },
            {
              title: 'Hosting',
              text: 'Das Kundenportal wird auf Servern von Railway (San Francisco, USA) betrieben. Beim Aufruf werden technische Protokolldaten (Browser, Betriebssystem, IP-Adresse, Zeitstempel) erhoben. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
            },
            {
              title: 'Kontodaten',
              text: 'Zur Nutzung des Portals werden Name, E-Mail-Adresse und ein Passwort gespeichert. Diese Daten dienen ausschließlich der Authentifizierung und der Darstellung Ihrer Vertragsdaten. Sie werden nicht an Dritte weitergegeben.',
            },
            {
              title: 'Kommunikation per E-Mail',
              text: 'E-Mail-Benachrichtigungen (Willkommensmail, Rechnungen, Ticket-Antworten) werden über den Dienst Resend (Resend Inc., USA) versendet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b und f DSGVO.',
            },
            {
              title: 'Sicherheit',
              text: 'Die Übertragung erfolgt SSL/TLS-verschlüsselt. Passwörter werden ausschließlich als bcrypt-Hash gespeichert und sind nicht im Klartext einsehbar.',
            },
            {
              title: 'Cookies & Speicherung',
              text: 'Das Portal verwendet ausschließlich technisch notwendige Speicherung (localStorage) für die Anmeldesitzung und Designpräferenzen. Es werden keine Tracking-Cookies eingesetzt.',
            },
            {
              title: 'Ihre Rechte',
              text: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Wenden Sie sich dazu an: philip@fastlanesolutions.de',
            },
            {
              title: 'Beschwerderecht',
              text: 'Sie haben das Recht, sich bei der Datenschutzaufsichtsbehörde zu beschweren. Zuständig ist die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover.',
            },
          ].map(({ title, text }) => (
            <section key={title} style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

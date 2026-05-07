import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Datenschutz() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Zurück
        </Link>

        <div className="card">
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Datenschutzerklärung</h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 28 }}>Stand: Mai 2026</p>

          {[
            {
              title: '1. Verantwortlicher',
              text: 'Philip Köhler\nTrift 18, 29308 Winsen (Aller)\nE-Mail: philip@fastlanesolutions.de\nTelefon: 0151 / 2189 6391',
            },
            {
              title: '2. Grundsätze der Datenverarbeitung',
              text: 'Diese Anwendung verarbeitet personenbezogene Daten gemäß der DSGVO und dem deutschen Datenschutzrecht. Die Erhebung beschränkt sich auf technisch notwendige Informationen zur Erfüllung des Vertrages (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Wahrung berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO).',
            },
            {
              title: '3. Hosting (Railway)',
              text: 'Das Kundenportal wird auf Servern von Railway Inc. (San Francisco, USA) betrieben. Beim Aufruf werden technische Protokolldaten (Browser, Betriebssystem, IP-Adresse, Zeitstempel) verarbeitet.\n\nMit Railway Inc. besteht ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO. Die Übermittlung personenbezogener Daten in die USA erfolgt auf Grundlage von EU-Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO.\n\nRechtsgrundlage der Verarbeitung: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb).',
            },
            {
              title: '4. Kontodaten',
              text: 'Zur Nutzung des Portals werden Name, E-Mail-Adresse und ein verschlüsseltes Passwort (bcrypt-Hash) gespeichert. Diese Daten dienen ausschließlich der Authentifizierung und der Darstellung Ihrer Vertragsdaten. Sie werden nicht an Dritte weitergegeben.',
            },
            {
              title: '5. Kommunikation per E-Mail (Resend)',
              text: 'E-Mail-Benachrichtigungen (Willkommensmail, Rechnungsbenachrichtigungen, Ticket-Antworten) werden über den Dienst Resend Inc. (USA) versendet.\n\nMit Resend Inc. besteht ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO. Die Übermittlung in die USA erfolgt auf Grundlage von EU-Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO.\n\nRechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO.',
            },
            {
              title: '6. Zwei-Faktor-Authentifizierung',
              text: 'Wenn Sie die optionale Zwei-Faktor-Authentifizierung (2FA) aktivieren, wird bei der Anmeldung ein einmaliger Bestätigungscode an Ihre E-Mail-Adresse gesendet. Dieser Code wird für maximal 10 Minuten gespeichert und danach automatisch gelöscht.',
            },
            {
              title: '7. Sicherheit',
              text: 'Die Übertragung aller Daten erfolgt SSL/TLS-verschlüsselt. Passwörter werden ausschließlich als bcrypt-Hash gespeichert und sind nicht im Klartext einsehbar. Zugriffsversuche werden protokolliert.',
            },
            {
              title: '8. Cookies & lokale Speicherung',
              text: 'Das Portal verwendet ausschließlich technisch notwendige lokale Speicherung (localStorage) für die Anmeldesitzung und Designpräferenzen (Darkmode/Lightmode). Es werden keine Tracking-Cookies oder Analysetools eingesetzt. Eine separate Cookie-Einwilligung ist daher nicht erforderlich.',
            },
            {
              title: '9. Speicherdauer',
              text: 'Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine gesetzlichen Aufbewahrungsfristen entgegenstehen. Aktivitätsprotokolle werden nach 12 Monaten automatisch bereinigt.',
            },
            {
              title: '10. Ihre Rechte (Art. 15–21 DSGVO)',
              text: 'Sie haben das Recht auf:\n• Auskunft über Ihre gespeicherten Daten (Art. 15)\n• Berichtigung unrichtiger Daten (Art. 16)\n• Löschung Ihrer Daten (Art. 17) – Anfrage per E-Mail an philip@fastlanesolutions.de\n• Einschränkung der Verarbeitung (Art. 18)\n• Datenübertragbarkeit (Art. 20)\n• Widerspruch gegen die Verarbeitung (Art. 21)\n\nBitte wenden Sie sich für die Ausübung Ihrer Rechte an: philip@fastlanesolutions.de',
            },
            {
              title: '11. Beschwerderecht',
              text: 'Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Zuständig ist:\n\nLandesbeauftragte für den Datenschutz Niedersachsen\nPrinzenstraße 5, 30159 Hannover\nwww.lfd.niedersachsen.de',
            },
          ].map(({ title, text }) => (
            <section key={title} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.85, whiteSpace: 'pre-line', margin: 0 }}>{text}</p>
            </section>
          ))}

          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-dim)' }}>
            Diese Datenschutzerklärung gilt für das FastLane Kundenportal. Für Fragen wenden Sie sich an{' '}
            <a href="mailto:philip@fastlanesolutions.de" style={{ color: 'var(--accent)' }}>philip@fastlanesolutions.de</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

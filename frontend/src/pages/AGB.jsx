import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{title}</h2>
    <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.85 }}>{children}</div>
  </section>
);

export default function AGB() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Zurück
        </Link>

        <div className="card">
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Allgemeine Geschäftsbedingungen</h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 32 }}>
            FastLane Solutions · Philip Köhler · Stand: Mai 2026
          </p>

          <Section title="§ 1 Geltungsbereich">
            <p style={{ margin: '0 0 10px' }}>
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung des FastLane Kundenportals (nachfolgend „Portal"), das von Philip Köhler, Trift 18, 29308 Winsen (Aller), betrieben wird (nachfolgend „FastLane Solutions" oder „Anbieter").
            </p>
            <p style={{ margin: 0 }}>
              Das Portal steht ausschließlich gewerblichen Nutzern (B2B) zur Verfügung. Es gilt deutsches Recht. Abweichende AGB des Nutzers haben keine Gültigkeit, es sei denn, der Anbieter stimmt diesen ausdrücklich schriftlich zu.
            </p>
          </Section>

          <Section title="§ 2 Zugang und Nutzerkonto">
            <p style={{ margin: '0 0 10px' }}>
              Der Zugang zum Portal wird vom Anbieter eingerichtet und ist nicht übertragbar. Zugangsdaten sind vertraulich zu behandeln und dürfen nicht an Dritte weitergegeben werden. Der Nutzer ist verpflichtet, den Anbieter unverzüglich zu informieren, wenn er Kenntnis von einem Missbrauch seiner Zugangsdaten erlangt.
            </p>
            <p style={{ margin: 0 }}>
              Der Anbieter ist berechtigt, den Zugang bei Verstößen gegen diese AGB oder bei Zahlungsverzug vorübergehend zu sperren oder dauerhaft zu deaktivieren.
            </p>
          </Section>

          <Section title="§ 3 Pflichten des Nutzers">
            <p style={{ margin: '0 0 10px' }}>Der Nutzer verpflichtet sich:</p>
            <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>
              <li>das Portal ausschließlich für rechtmäßige Zwecke zu nutzen;</li>
              <li>keine automatisierten Zugriffe (Bots, Scraper) durchzuführen;</li>
              <li>keine Maßnahmen zu ergreifen, die die Stabilität oder Sicherheit des Portals gefährden;</li>
              <li>seine Kontaktdaten aktuell zu halten und Änderungen unverzüglich mitzuteilen.</li>
            </ul>
            <p style={{ margin: 0 }}>
              Bei Verstößen gegen diese Pflichten haftet der Nutzer für alle dadurch entstehenden Schäden.
            </p>
          </Section>

          <Section title="§ 4 Leistungsumfang des Portals">
            <p style={{ margin: '0 0 10px' }}>
              Das Portal ermöglicht dem Nutzer die Einsicht in Verträge, Rechnungen und Kontaktinformationen sowie die Kommunikation mit dem Anbieter über das Ticket-System. Die im Portal enthaltenen Informationen dienen der Dokumentation der Geschäftsbeziehung und ersetzen keine verbindlichen Vereinbarungen.
            </p>
            <p style={{ margin: 0 }}>
              Der Anbieter behält sich das Recht vor, den Funktionsumfang des Portals jederzeit zu erweitern, einzuschränken oder anzupassen.
            </p>
          </Section>

          <Section title="§ 5 Verfügbarkeit">
            <p style={{ margin: '0 0 10px' }}>
              Der Anbieter bemüht sich um eine hohe Verfügbarkeit des Portals, übernimmt jedoch keine Garantie für eine ununterbrochene Erreichbarkeit. Geplante Wartungsarbeiten werden nach Möglichkeit vorab angekündigt.
            </p>
            <p style={{ margin: 0 }}>
              Ausfälle durch höhere Gewalt, technische Störungen der Infrastruktur (insbesondere des Hostinganbieters Railway) oder Angriffe von außen liegen außerhalb des Einflussbereichs des Anbieters und begründen keine Haftung.
            </p>
          </Section>

          <Section title="§ 6 Datenschutz">
            <p style={{ margin: 0 }}>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung des Portals und der Datenschutz-Grundverordnung (DSGVO). Die Datenschutzerklärung ist unter <Link to="/datenschutz" style={{ color: 'var(--accent)' }}>fastlanesolutions.de/datenschutz</Link> abrufbar.
            </p>
          </Section>

          <Section title="§ 7 Haftungsbeschränkung">
            <p style={{ margin: '0 0 10px' }}>
              Der Anbieter haftet für Schäden aus der Nutzung des Portals nur bei Vorsatz und grober Fahrlässigkeit sowie bei der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Bei einfacher Fahrlässigkeit ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
            </p>
            <p style={{ margin: 0 }}>
              Die Haftungsbeschränkung gilt nicht bei der Verletzung von Leben, Körper oder Gesundheit sowie bei zwingend gesetzlicher Haftung.
            </p>
          </Section>

          <Section title="§ 8 Laufzeit des Portalzugangs">
            <p style={{ margin: 0 }}>
              Der Zugang zum Portal wird für die Dauer der bestehenden Geschäftsbeziehung gewährt. Mit Beendigung der zugrundeliegenden Vertragsbeziehung erlischt das Nutzungsrecht am Portal automatisch. Der Anbieter löscht oder sperrt den Zugang in diesem Fall ohne gesonderte Kündigung.
            </p>
          </Section>

          <Section title="§ 9 Änderungen dieser AGB">
            <p style={{ margin: 0 }}>
              Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden dem Nutzer per E-Mail oder durch Hinweis im Portal mitgeteilt. Widerspricht der Nutzer nicht innerhalb von vier Wochen nach Zugang der Mitteilung, gelten die geänderten AGB als angenommen.
            </p>
          </Section>

          <Section title="§ 10 Schlussbestimmungen">
            <p style={{ margin: '0 0 10px' }}>
              Es gilt ausschließlich deutsches Recht unter Ausschluss des UN-Kaufrechts.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesen AGB ist, soweit gesetzlich zulässig, Celle.
            </p>
            <p style={{ margin: 0 }}>
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht.
            </p>
          </Section>

          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-dim)' }}>
            <strong>Kontakt:</strong> philip@fastlanesolutions.de · 0151 / 2189 6391
          </div>
        </div>
      </div>
    </div>
  );
}

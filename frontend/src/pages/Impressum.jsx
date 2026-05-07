import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Impressum() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Zurück
        </Link>

        <div className="card">
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Impressum</h1>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angaben gemäß § 5 TMG</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              FastLane Solutions<br />
              Philip Köhler<br />
              Trift 18<br />
              29308 Winsen (Aller)<br />
              Deutschland
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Kontakt</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Telefon: 0151 / 2189 6391<br />
              E-Mail: philip@fastlanesolutions.de
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Berufsbezeichnung</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              IT-Berater / KI-Berater<br />
              Zuständige Kammer: Deutschland
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Umsatzsteuer</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Umsatzsteuerbefreit nach § 19 UStG (Kleinunternehmerregelung)
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Streitschlichtung</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Urheberrecht</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.<br /><br />
              © 2025 FastLane Solutions
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

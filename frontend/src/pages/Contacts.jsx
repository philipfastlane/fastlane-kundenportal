import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import api from '../api';


function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contacts').then((r) => {
      setContacts(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" /> Ansprechpartner werden geladen...
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ansprechpartner</h1>
          <p className="page-subtitle">Ihre persönlichen Ansprechpartner bei uns</p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Keine Ansprechpartner vorhanden</div>
          <div className="empty-text">Kontaktieren Sie uns, um Ihre Ansprechpartner zu erhalten.</div>
        </div>
      ) : (
        <div className="contacts-grid">
          {contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-avatar">
                {initials(contact.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="contact-name">{contact.name}</div>
                {contact.position && (
                  <div className="contact-position">{contact.position}</div>
                )}
                {contact.department && (
                  <span className="contact-dept">{contact.department}</span>
                )}
                <div className="contact-links">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="contact-link">
                      <Mail size={13} />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="contact-link">
                      <Phone size={13} />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

import { Award, CalendarDays } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useData } from '../context/DataContext';

export default function Certificates() {
  const { certificates, loading } = useData();

  return (
    <section id="certificates" className="section">
      <div className="container">
        <SectionHeading eyebrow="LEARNING & GROWTH" title="Courses & Certificates" description="Continuous learning is part of the work." />
        <div className="certificates-grid">
          {certificates.map((certificate) => (
            <article className="certificate-card glass-card" key={certificate.id}>
              <div className="certificate-card__image">
                {certificate.imageUrl ? (
                  <img src={certificate.imageUrl} alt={`${certificate.title} certificate`} loading="lazy" />
                ) : (
                  <div className="certificate-card__placeholder"><Award size={42} strokeWidth={1.2} /></div>
                )}
              </div>
              <div className="certificate-card__body">
                <h3>{certificate.title}</h3>
                {certificate.organization && <p className="certificate-card__org">{certificate.organization}</p>}
                <p className="certificate-card__description">{certificate.description}</p>
                <div className="certificate-card__date"><CalendarDays size={15} /> {certificate.issueDate || 'Not specified'}</div>
              </div>
            </article>
          ))}
          {!loading && certificates.length === 0 && (
            <p className="empty-state">Certificates can be added in Admin Mode.</p>
          )}
        </div>
      </div>
    </section>
  );
}

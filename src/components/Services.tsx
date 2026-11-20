import { ArrowUpRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { serviceIcons } from '../data/static';
import { useData } from '../context/DataContext';

export default function Services() {
  const { services } = useData();

  return (
    <section id="services" className="section section--tinted">
      <div className="container">
        <SectionHeading eyebrow="HOW I CAN HELP" title="Services" description="Flexible creative and technical support for your next idea." />
        <div className="services-grid">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon] || serviceIcons.Sparkles;
            return (
              <article className="service-card glass-card" key={service.id}>
                <span className="service-card__icon"><Icon size={24} strokeWidth={1.8} /></span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a className="service-card__link" href="#contact">
                  {service.ctaText || 'Request a Quote'} <ArrowUpRight size={17} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

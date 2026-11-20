import SectionHeading from './SectionHeading';
import { skills } from '../data/static';

export default function Skills() {
  return (
    <section id="skills" className="section section--tinted">
      <div className="container">
        <SectionHeading eyebrow="WHAT I DO" title="Skills & Expertise" description="A versatile toolkit for design, development and intelligent digital work." />
        <div className="skills-grid">
          {skills.map(({ title, detail, icon: Icon }, index) => (
            <article className="skill-card glass-card" key={title} style={{ animationDelay: `${index * 35}ms` }}>
              <span className="skill-card__icon"><Icon size={23} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{detail}</p>
              <span className="skill-card__index">{String(index + 1).padStart(2, '0')}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

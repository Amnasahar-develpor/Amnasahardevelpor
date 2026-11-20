import { Compass, HeartHandshake, Lightbulb, MonitorSmartphone } from 'lucide-react';
import SectionHeading from './SectionHeading';

const points = [
  { icon: Lightbulb, title: 'Creative approach', text: 'I start with the idea, the audience and the feeling a product should create — then shape every detail around it.' },
  { icon: MonitorSmartphone, title: 'Web design & development', text: 'From first layout to responsive build, I care about clean structure, readable content and smooth interaction.' },
  { icon: Compass, title: 'Interest in AI', text: 'I explore practical AI tools and intelligent interfaces that make digital experiences more helpful and human.' },
  { icon: HeartHandshake, title: 'My goal', text: 'To create beautiful and useful digital experiences that help people and brands express their best work.' },
];

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeading eyebrow="GET TO KNOW ME" title="About Me" description="A little about the person behind the work." />
        <div className="about__grid">
          <div className="about__intro glass-card">
            <p className="about__lead">
              I'm <strong>Amna Sahar</strong>, an <strong>AI Developer</strong> and <strong>Creative Web Developer</strong>
              {' '}with a genuine love for graphic design, website creation, AI tools and digital creativity.
            </p>
            <p>
              I see design and technology as one craft. A great digital product should be visually
              elegant, easy to understand and technically dependable. That belief guides the way I
              approach every website, brand asset and AI-powered idea.
            </p>
            <p>
              My journey in web design and development has been about learning, experimenting and
              refining — building experiences that balance clarity with personality. I'm especially
              excited about Artificial Intelligence and the creative possibilities it opens up.
            </p>
            <a className="text-link" href="#projects">See what I've built <span aria-hidden="true">→</span></a>
          </div>
          <div className="about__points">
            {points.map(({ icon: Icon, title, text }) => (
              <article key={title} className="about-point glass-card">
                <div className="about-point__icon"><Icon size={22} /></div>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

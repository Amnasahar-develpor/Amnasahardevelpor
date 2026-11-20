import { lazy, Suspense } from 'react';
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react';

const Assistant3D = lazy(() => import('./Assistant3D'));
import AssistantPanel from './AssistantPanel';
import { roleTags } from '../data/static';
import { useAssistant } from '../hooks/useAssistant';
import { useData } from '../context/DataContext';

export default function Hero() {
  const assistant = useAssistant();
  const { config } = useData();

  return (
    <section id="home" className="hero container">
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="eyebrow"><Sparkles size={14} /> HELLO, I'M AMNA SAHAR</div>
          <h1 className="hero__title">
            AI DEVELOPER <span className="text-gradient">&amp; CREATIVE</span> WEB DEVELOPER
          </h1>
          <p className="hero__lead">
            I design and build intelligent, beautiful digital experiences — blending artificial
            intelligence, thoughtful web design and creative visual storytelling.
          </p>
          <p className="hero__body">
            My work spans AI development, website creation, graphic design and digital creativity.
            I enjoy turning ideas into polished, useful products that feel effortless to use and
            look remarkable on every screen.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#projects">Explore My Work <ArrowUpRight size={18} /></a>
            <a className="btn btn--ghost" href="#contact">Contact Me <ArrowDownRight size={18} /></a>
          </div>
          <div className="hero__tags" aria-label="Professional roles">
            {roleTags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        </div>

        <div className="hero__stage">
          <div className="hero__stage-glow" aria-hidden="true" />
          <div className="hero__stage-frame glass-card">
            <Suspense fallback={<div className="character-loading">Preparing 3D assistant…</div>}>
              <Assistant3D mode={assistant.mode} muted={assistant.muted} />
            </Suspense>
            <div className="hero__stage-badge">
              <span className="status-dot status-dot--idle" /> Interactive 3D Assistant
            </div>
          </div>
          <AssistantPanel assistant={assistant} provider={config.voiceProvider} />
        </div>
      </div>
    </section>
  );
}

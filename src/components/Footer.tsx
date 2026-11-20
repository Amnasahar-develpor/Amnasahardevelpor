import { ArrowUp, Sparkles } from 'lucide-react';
import { navItems } from '../data/static';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <a href="#home" className="brand">
            <span className="brand__mark">AS</span>
            <span className="brand__text"><strong>Amna Sahar</strong><small>AI &amp; Creative Web Developer</small></span>
          </a>
          <p className="footer__tagline"><Sparkles size={14} /> Creating beautiful and useful digital experiences.</p>
        </div>
        <nav className="footer__links" aria-label="Footer navigation">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <button type="button" className="footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top <ArrowUp size={16} />
        </button>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Amna Sahar. All rights reserved.</span>
        <span>Designed &amp; built with care.</span>
      </div>
    </footer>
  );
}

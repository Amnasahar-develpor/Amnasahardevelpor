import { useEffect, useState } from 'react';
import { Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { navItems } from '../data/static';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onAdminClick }: { onAdminClick: () => void }) {
  const { theme, toggle } = useTheme();
  const { authenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="#home" className="brand" aria-label="Amna Sahar — home">
          <span className="brand__mark">AS</span>
          <span className="brand__text"><strong>Amna Sahar</strong><small>AI &amp; Creative Web Developer</small></span>
        </a>

        <nav className={`nav-links ${open ? 'nav-links--open' : ''}`} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <button type="button" className="nav-links__admin" onClick={() => { setOpen(false); onAdminClick(); }}>
            <ShieldCheck size={16} /> {authenticated ? 'Admin Dashboard' : 'Admin Mode'}
          </button>
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

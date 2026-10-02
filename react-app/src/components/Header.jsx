import { useState } from 'react';
import { themes } from '../data';

export default function Header({ theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="nav container" aria-label="Primary">
        <a
          href="#main"
          className="logo"
          aria-label="Fazla Rabbi - back to top"
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          FR
        </a>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Toggle theme selector"
          aria-expanded={menuOpen}
          aria-controls="theme-selector"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className="fas fa-bars" aria-hidden="true"></i>
        </button>

        <div
          id="theme-selector"
          className="theme-selector"
          role="group"
          aria-label="Colour theme"
          style={menuOpen ? { display: 'flex' } : undefined}
        >
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-btn${theme === t.id ? ' active' : ''}`}
              data-theme={t.id}
              aria-pressed={theme === t.id}
              onClick={() => setTheme(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

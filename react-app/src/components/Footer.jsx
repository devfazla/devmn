import { socialLinks } from '../data';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <nav className="social-links fade-in" aria-label="Social profiles">
          {socialLinks.map((link) => {
            const isEmail = link.href.startsWith('mailto:');
            // rel="me" declares these as your own profiles (identity / E-E-A-T signal)
            return (
              <a
                className="social-link"
                href={link.href}
                aria-label={link.label}
                key={link.label}
                rel={isEmail ? undefined : 'noreferrer me'}
                {...(isEmail ? {} : { target: '_blank' })}
              >
                <i className={link.icon} aria-hidden="true"></i>
              </a>
            );
          })}
        </nav>
        <p className="fade-in" style={{ color: 'var(--text-secondary)' }}>
          &copy; {new Date().getFullYear()}{' '}
          <a href="https://devfazla.com/" rel="me" style={{ color: 'inherit' }}>
            Fazla Rabbi
          </a>
          . All rights reserved. | Built with passion and modern web technologies.
        </p>
      </div>
    </footer>
  );
}

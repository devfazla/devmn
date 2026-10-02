import profileImage from '../assets/profile.jpg';

function scrollToSection(event, selector) {
  event.preventDefault();
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Software Developer</p>
          <h1 className="hero-name">Fazla Rabbi</h1>
          <p className="hero-description">
            Android, Flutter and web apps built with clean code and considered design.
          </p>
          <div className="hero-buttons">
            <a
              href="#projects"
              className="btn btn-primary"
              onClick={(e) => scrollToSection(e, '#projects')}
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="btn btn-secondary"
              onClick={(e) => scrollToSection(e, '#contact')}
            >
              Get in touch
            </a>
          </div>
        </div>

        <div className="hero-media">
          <img
            className="hero-photo"
            src={profileImage}
            alt="Fazla Rabbi, software developer"
            width="440"
            height="440"
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

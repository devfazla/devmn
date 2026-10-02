import { useRef, useState } from 'react';

const contactItems = [
  {
    icon: 'fas fa-envelope',
    title: 'Email',
    text: 'admin@fazla.pro',
    href: 'mailto:admin@fazla.pro',
  },
  {
    icon: 'fab fa-linkedin',
    title: 'LinkedIn',
    text: 'linkedin.com/in/fzlr',
    href: 'https://www.linkedin.com/in/fzlr/',
    external: true,
  },
  {
    icon: 'fab fa-github',
    title: 'GitHub',
    text: 'github.com/fazla-cloud',
    href: 'https://github.com/fazla-cloud',
    external: true,
  },
  {
    icon: 'fas fa-phone',
    title: 'Phone',
    text: '+880 184 585 5131',
    href: 'tel:+8801845855131',
  },
];

export default function Contact() {
  const formRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!(name && email && message)) return;

    // Simulate form submission (same behaviour as the original page)
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => {
        setStatus('idle');
        formRef.current?.reset();
      }, 2000);
    }, 1500);
  };

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <h2 id="contact-title" className="section-title fade-in">
          Contact
        </h2>
        <div className="contact-content">
          <div className="contact-form fade-in">
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input form-textarea"
                  placeholder="Tell me about your project..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: status === 'sent' ? '#10b981' : undefined,
                }}
                disabled={status !== 'idle'}
              >
                {status === 'idle' && (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Message
                  </>
                )}
                {status === 'sending' && (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                  </>
                )}
                {status === 'sent' && (
                  <>
                    <i className="fas fa-check"></i>
                    Message Sent!
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="contact-info fade-in">
            {contactItems.map((item) => (
              <div className="contact-item" key={item.title}>
                <div className="contact-icon" aria-hidden="true">
                  <i className={item.icon}></i>
                </div>
                <div className="contact-details">
                  <h4>{item.title}</h4>
                  <p>
                    <a
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {item.text}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

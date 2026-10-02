import { projects } from '../data';

export default function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <h2 id="projects-title" className="section-title fade-in">
          Selected work
        </h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <article
              className={`project-card fade-in${index === 0 ? ' featured' : ''}`}
              key={project.title}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="project-media">
                <img
                  className="project-cover"
                  src={project.cover}
                  alt={project.coverAlt}
                  width="1200"
                  height="750"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
              <div className="project-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <ul className="project-tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

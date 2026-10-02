import { skills } from '../data';

export default function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <h2 id="skills-title" className="section-title fade-in">
          What I build with
        </h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div
              className="skill-card fade-in"
              key={skill.title}
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="skill-icon" aria-hidden="true">
                <i className={skill.icon}></i>
              </div>
              <h3 className="skill-title">{skill.title}</h3>
              <ul className="skill-chips">
                {skill.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

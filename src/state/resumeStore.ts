import type { ResumeDocument } from '../models/ResumeDocument';

const text = (id: string, content: string, bold = false) => ({
  id, type: 'text' as const, content, formatting: bold ? { bold } : undefined,
});
const bullet = (id: string, content: string) => ({ id, content: text(`${id}-text`, content) });

export const initialResume: ResumeDocument = {
  page: { width: 8.5, height: 11, margins: { top: 0.42, right: 0.55, bottom: 0.45, left: 0.55 } },
  settings: { fontFamily: 'Arial', baseFontSize: 9.2, lineSpacing: 1.16 },
  header: {
    name: text('header-name', 'Jake Ryan', true),
    contactInfo: [text('contact-phone', '123-456-7890'), text('contact-email', 'jake@su.edu'), text('contact-linkedin', 'linkedin.com/in/jake'), text('contact-github', 'github.com/jake')],
  },
  education: {
    id: 'education', title: text('education-title', 'Education', true), spacingAfter: 8, entrySpacing: 5,
    entries: [{ id: 'education-su', organization: text('education-su-organization', 'Southwestern University', true), role: text('education-su-degree', 'Bachelor of Arts in Computer Science, Minor in Business'), location: text('education-su-location', 'Georgetown, TX'), dates: text('education-su-dates', 'Aug. 2018 -- May 2021'), bullets: [bullet('education-su-bullet-1', 'Relevant Coursework: Data Structures, Algorithms, Computer Architecture, Operating Systems, Applied Statistics, Discrete Mathematics')] }],
  },
  experience: {
    id: 'experience', title: text('experience-title', 'Experience', true), spacingAfter: 8, entrySpacing: 6,
    entries: [
      { id: 'experience-su', organization: text('experience-su-organization', 'Southwestern University', true), role: text('experience-su-role', 'Undergraduate Research Assistant'), location: text('experience-su-location', 'Georgetown, TX'), dates: text('experience-su-dates', 'June 2020 -- Present'), bullets: [bullet('experience-su-bullet-1', 'Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems.'), bullet('experience-su-bullet-2', 'Built a responsive web application with React to visualize student engagement data for faculty.') ] },
      { id: 'experience-tesla', organization: text('experience-tesla-organization', 'Tesla, Inc.', true), role: text('experience-tesla-role', 'Software Engineering Intern'), location: text('experience-tesla-location', 'Palo Alto, CA'), dates: text('experience-tesla-dates', 'May 2019 -- Aug. 2019'), bullets: [bullet('experience-tesla-bullet-1', 'Created internal tooling that reduced validation time for manufacturing data by 35%.'), bullet('experience-tesla-bullet-2', 'Partnered with engineers to ship reliable Python services and clear operational dashboards.') ] },
    ],
  },
  projects: {
    id: 'projects', title: text('projects-title', 'Projects', true), spacingAfter: 8, entrySpacing: 6,
    entries: [
      { id: 'project-chat', name: text('project-chat-name', 'Real Time Chat App', true), technologies: text('project-chat-tech', 'React, Node.js, Socket.io'), dates: text('project-chat-dates', 'Jan. 2020 -- May 2020'), bullets: [bullet('project-chat-bullet-1', 'Built a real-time messaging application with authenticated rooms and responsive interactions.'), bullet('project-chat-bullet-2', 'Deployed an API and client application using a modern CI workflow.') ] },
      { id: 'project-search', name: text('project-search-name', 'Search Engine', true), technologies: text('project-search-tech', 'Python, Flask, BeautifulSoup'), dates: text('project-search-dates', 'Sept. 2019 -- Dec. 2019'), bullets: [bullet('project-search-bullet-1', 'Implemented a crawler, inverted index, and ranked search interface for a corpus of web pages.')] },
    ],
  },
  technicalSkills: { id: 'technical-skills', title: text('technical-skills-title', 'Technical Skills', true), spacingAfter: 0, categories: [
    { id: 'skills-languages', label: text('skills-languages-label', 'Languages:', true), skills: text('skills-languages', ' Java, Python, C/C++, SQL, JavaScript, HTML/CSS') },
    { id: 'skills-frameworks', label: text('skills-frameworks-label', 'Frameworks:', true), skills: text('skills-frameworks', ' React, Node.js, Flask, FastAPI, JUnit, WordPress') },
    { id: 'skills-tools', label: text('skills-tools-label', 'Developer Tools:', true), skills: text('skills-tools', ' Git, Docker, Google Cloud Platform, VS Code, Visual Studio, PyCharm') },
  ] },
};

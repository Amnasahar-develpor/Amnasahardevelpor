import { useEffect, useState } from 'react';
import { ArrowUpRight, ExternalLink, Github, ImageIcon, X } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useData } from '../context/DataContext';
import type { Project } from '../types';

function ProjectThumb({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  if (!project.imageUrl || failed) {
    return (
      <div className="project-thumb project-thumb--placeholder" aria-hidden="true">
        <span className="project-thumb__mark">{project.title.slice(0, 2).toUpperCase()}</span>
        <ImageIcon size={19} />
      </div>
    );
  }
  return (
    <div className="project-thumb">
      <img src={project.imageUrl} alt={`${project.title} preview`} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card glass-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={project.title}>
        <button type="button" className="modal-card__close icon-button" onClick={onClose} aria-label="Close project details"><X size={20} /></button>
        <ProjectThumb project={project} />
        <div className="modal-card__body">
          <span className="pill">{project.category}</span>
          <h3>{project.title}</h3>
          <p>{project.description || 'No description has been added for this project yet.'}</p>
          <div className="project-card__tags">
            {project.tags.map((tag) => <span key={tag} className="tag tag--small">{tag}</span>)}
          </div>
          <div className="modal-card__meta">{project.year ? `Year: ${project.year}` : 'Year: not specified'}</div>
          <div className="modal-card__links">
            {project.liveUrl && <a className="btn btn--primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit Live Website <ExternalLink size={16} /></a>}
            {project.githubUrl && <a className="btn btn--ghost" href={project.githubUrl} target="_blank" rel="noopener noreferrer">View on GitHub <Github size={16} /></a>}
            {!project.liveUrl && !project.githubUrl && <p className="muted">Links can be added by Amna in Admin Mode.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, loading } = useData();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Project | null>(null);

  const categories = ['All', ...Array.from(new Set(projects.map((project) => project.category || 'Portfolio')))];
  const visible = filter === 'All' ? projects : projects.filter((project) => (project.category || 'Portfolio') === filter);

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeading eyebrow="SELECTED WORK" title="Projects & Portfolio" description="A growing collection of AI, web and design work." />
        <div className="filter-bar" role="group" aria-label="Filter projects by category">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`filter-pill ${filter === category ? 'filter-pill--active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {visible.map((project) => (
            <article className="project-card glass-card" key={project.id}>
              <ProjectThumb project={project} />
              <div className="project-card__body">
                <div className="project-card__meta">
                  <span className="pill">{project.category}</span>
                  <span>{project.year || 'Year —'}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description || 'Details for this project can be added in Admin Mode.'}</p>
                <div className="project-card__tags">
                  {project.tags.slice(0, 4).map((tag) => <span key={tag} className="tag tag--small">{tag}</span>)}
                </div>
                <button type="button" className="project-card__button" onClick={() => setSelected(project)}>
                  View Project <ArrowUpRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!loading && visible.length === 0 && <p className="empty-state">No projects in this category yet. New work can be added in Admin Mode.</p>}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

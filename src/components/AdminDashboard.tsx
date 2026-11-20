import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Award, BriefcaseBusiness, ImagePlus, LayoutDashboard, LockKeyhole, LogOut, Mail,
  Pencil, Plus, Save, Settings2, ShieldCheck, Trash2, X,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import type { Certificate, ContactMessage, Project, Service, SiteSettings } from '../types';

type Tab = 'projects' | 'certificates' | 'services' | 'messages' | 'settings';

interface ProjectForm {
  id?: string; title: string; description: string; category: string;
  tags: string; year: string; imageUrl: string; liveUrl: string; githubUrl: string;
}
interface CertificateForm {
  id?: string; title: string; organization: string; description: string;
  issueDate: string; imageUrl: string;
}
interface ServiceForm {
  id?: string; title: string; description: string; icon: string; ctaText: string;
}

const emptyProject: ProjectForm = { title: '', description: '', category: 'Portfolio', tags: '', year: '', imageUrl: '', liveUrl: '', githubUrl: '' };
const emptyCertificate: CertificateForm = { title: '', organization: '', description: '', issueDate: '', imageUrl: '' };
const emptyService: ServiceForm = { title: '', description: '', icon: 'Sparkles', ctaText: 'Request a Quote' };

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { key: 'certificates', label: 'Certificates', icon: Award },
  { key: 'services', label: 'Services', icon: LayoutDashboard },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'settings', label: 'Settings', icon: Settings2 },
];

export default function AdminDashboard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { authenticated, checking, login, logout } = useAuth();
  const { projects, certificates, services, config, refresh, setConfig } = useData();
  const { notify } = useToast();

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('projects');
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [certificateForm, setCertificateForm] = useState<CertificateForm>(emptyCertificate);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyService);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(config.settings);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setSettingsForm(config.settings);
  }, [config.settings, open]);

  useEffect(() => {
    if (authenticated && tab === 'messages') {
      api.messages().then(setMessages).catch((error) => notify(error.message, 'error'));
    }
  }, [authenticated, tab, notify]);

  if (!open) return null;

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setBusy(true);
    try {
      await login(password);
      setPassword('');
      notify('Admin session started.');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const scrollToForm = () => window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);

  const upload = async (event: ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Please choose an image file.', 'error'); return; }
    setBusy(true);
    try {
      const url = await api.uploadImage(file);
      setter(url);
      notify('Image uploaded.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Upload failed.', 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const saveProject = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload: Partial<Project> = {
        ...(projectForm.id ? { id: projectForm.id } : {}),
        title: projectForm.title,
        description: projectForm.description,
        category: projectForm.category || 'Portfolio',
        tags: projectForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        year: projectForm.year,
        imageUrl: projectForm.imageUrl || null,
        liveUrl: projectForm.liveUrl,
        githubUrl: projectForm.githubUrl,
      };
      await api.saveProject(payload);
      setProjectForm(emptyProject);
      await refresh();
      notify(projectForm.id ? 'Project updated.' : 'Project added and published.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not save project.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const editProject = (project: Project) => {
    setProjectForm({
      id: project.id, title: project.title, description: project.description,
      category: project.category, tags: project.tags.join(', '), year: project.year,
      imageUrl: project.imageUrl || '', liveUrl: project.liveUrl, githubUrl: project.githubUrl,
    });
    scrollToForm();
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteProject(project.id);
      if (projectForm.id === project.id) setProjectForm(emptyProject);
      await refresh();
      notify('Project deleted.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete project.', 'error');
    }
  };

  const saveCertificate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload: Partial<Certificate> = {
        ...(certificateForm.id ? { id: certificateForm.id } : {}),
        title: certificateForm.title,
        organization: certificateForm.organization,
        description: certificateForm.description,
        issueDate: certificateForm.issueDate,
        imageUrl: certificateForm.imageUrl || null,
      };
      await api.saveCertificate(payload);
      setCertificateForm(emptyCertificate);
      await refresh();
      notify(certificateForm.id ? 'Certificate updated.' : 'Certificate added and published.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not save certificate.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const deleteCertificate = async (certificate: Certificate) => {
    if (!window.confirm(`Delete "${certificate.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteCertificate(certificate.id);
      await refresh();
      notify('Certificate deleted.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete certificate.', 'error');
    }
  };

  const saveService = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload: Partial<Service> = {
        ...(serviceForm.id ? { id: serviceForm.id } : {}),
        title: serviceForm.title,
        description: serviceForm.description,
        icon: serviceForm.icon,
        ctaText: serviceForm.ctaText,
      };
      await api.saveService(payload);
      setServiceForm(emptyService);
      await refresh();
      notify(serviceForm.id ? 'Service updated.' : 'Service added and published.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not save service.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const deleteService = async (service: Service) => {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteService(service.id);
      await refresh();
      notify('Service deleted.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete service.', 'error');
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const settings = await api.saveSettings(settingsForm);
      await refresh();
      setConfig({ ...config, settings, contactEmail: settings.contactEmail });
      notify('Settings saved.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not save settings.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true" aria-label="Admin dashboard">
      <div className="admin-shell">
        <header className="admin-shell__header">
          <div className="admin-shell__brand"><ShieldCheck size={20} /> Admin Mode</div>
          <div className="admin-shell__actions">
            {authenticated && (
              <button type="button" className="admin-logout" onClick={async () => { await logout(); notify('Signed out.'); }}>
                <LogOut size={16} /> Sign out
              </button>
            )}
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close admin dashboard"><X size={20} /></button>
          </div>
        </header>

        {checking ? (
          <div className="admin-state">Checking session…</div>
        ) : !authenticated ? (
          <div className="admin-login">
            <div className="admin-login__icon"><LockKeyhole size={28} /></div>
            <h2>Protected area</h2>
            <p>Sign in to manage projects, certificates, services and site settings.</p>
            <form onSubmit={handleLogin}>
              <label>
                <span>Admin password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required />
              </label>
              {loginError && <p className="field-error">{loginError}</p>}
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Sign In'}</button>
            </form>
          </div>
        ) : (
          <div className="admin-body">
            <aside className="admin-sidebar">
              <p className="admin-sidebar__label">MANAGE</p>
              {tabs.map(({ key, label, icon: Icon }) => (
                <button type="button" key={key} className={tab === key ? 'admin-tab admin-tab--active' : 'admin-tab'} onClick={() => setTab(key)}>
                  <Icon size={17} /> {label}
                </button>
              ))}
              <div className="admin-sidebar__tip">Changes are saved to the server and appear publicly right away.</div>
            </aside>

            <div className="admin-content">
              {tab === 'projects' && (
                <>
                  <div className="admin-content__head">
                    <div><h2>Projects</h2><p>Add, edit and publish portfolio work.</p></div>
                    <button type="button" className="btn btn--ghost" onClick={() => { setProjectForm(emptyProject); scrollToForm(); }}><Plus size={16} /> New Project</button>
                  </div>
                  <div className="admin-list">
                    {projects.map((project) => (
                      <div className="admin-list__row" key={project.id}>
                        <div className="admin-list__thumb">
                          {project.imageUrl ? <img src={project.imageUrl} alt="" /> : <ImagePlus size={18} />}
                        </div>
                        <div className="admin-list__info"><strong>{project.title}</strong><span>{project.category}{project.year ? ` · ${project.year}` : ''}</span></div>
                        <div className="admin-list__actions">
                          <button type="button" className="icon-button" onClick={() => editProject(project)} title="Edit project" aria-label={`Edit ${project.title}`}><Pencil size={16} /></button>
                          <button type="button" className="icon-button icon-button--danger" onClick={() => deleteProject(project)} title="Delete project" aria-label={`Delete ${project.title}`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="admin-form glass-card" ref={formRef}>
                    <h3>{projectForm.id ? 'Edit project' : 'Add a project'}</h3>
                    <form onSubmit={saveProject}>
                      <div className="form-row">
                        <label><span>Project title</span><input required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} /></label>
                        <label><span>Category</span><input value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })} placeholder="e.g. AI, Web Design" /></label>
                      </div>
                      <label><span>Description</span><textarea rows={3} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} /></label>
                      <div className="form-row">
                        <label><span>Tags (comma separated)</span><input value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="React, AI, Design" /></label>
                        <label><span>Year</span><input value={projectForm.year} onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })} placeholder="2026" maxLength={4} /></label>
                      </div>
                      <div className="form-row">
                        <label><span>Live website URL</span><input type="url" value={projectForm.liveUrl} onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })} placeholder="https://…" /></label>
                        <label><span>GitHub URL (optional)</span><input type="url" value={projectForm.githubUrl} onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })} placeholder="https://…" /></label>
                      </div>
                      <div className="admin-upload">
                        <label className="admin-upload__button"><ImagePlus size={17} /> Upload image<input type="file" accept="image/*" hidden onChange={(e) => upload(e, (url) => setProjectForm((current) => ({ ...current, imageUrl: url })))} /></label>
                        {projectForm.imageUrl && <img className="admin-upload__preview" src={projectForm.imageUrl} alt="Selected project preview" />}
                        <button type="button" className="admin-upload__clear" onClick={() => setProjectForm({ ...projectForm, imageUrl: '' })}>Remove image</button>
                      </div>
                      <button className="btn btn--primary" type="submit" disabled={busy}><Save size={16} /> {projectForm.id ? 'Save Changes' : 'Save Project'}</button>
                      {projectForm.id && <button type="button" className="btn btn--ghost" onClick={() => setProjectForm(emptyProject)}>Cancel edit</button>}
                    </form>
                  </div>
                </>
              )}

              {tab === 'certificates' && (
                <>
                  <div className="admin-content__head">
                    <div><h2>Certificates</h2><p>Certificates are stored separately from projects.</p></div>
                    <button type="button" className="btn btn--ghost" onClick={() => { setCertificateForm(emptyCertificate); scrollToForm(); }}><Plus size={16} /> New Certificate</button>
                  </div>
                  <div className="admin-list">
                    {certificates.map((certificate) => (
                      <div className="admin-list__row" key={certificate.id}>
                        <div className="admin-list__thumb">{certificate.imageUrl ? <img src={certificate.imageUrl} alt="" /> : <Award size={18} />}</div>
                        <div className="admin-list__info"><strong>{certificate.title}</strong><span>{certificate.organization || 'Organization not set'}</span></div>
                        <div className="admin-list__actions">
                          <button type="button" className="icon-button" onClick={() => { setCertificateForm({ id: certificate.id, title: certificate.title, organization: certificate.organization, description: certificate.description, issueDate: certificate.issueDate, imageUrl: certificate.imageUrl || '' }); scrollToForm(); }} aria-label={`Edit ${certificate.title}`}><Pencil size={16} /></button>
                          <button type="button" className="icon-button icon-button--danger" onClick={() => deleteCertificate(certificate)} aria-label={`Delete ${certificate.title}`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="admin-form glass-card" ref={formRef}>
                    <h3>{certificateForm.id ? 'Edit certificate' : 'Add a certificate'}</h3>
                    <form onSubmit={saveCertificate}>
                      <div className="form-row">
                        <label><span>Certificate title</span><input required value={certificateForm.title} onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })} /></label>
                        <label><span>Issuing organization</span><input value={certificateForm.organization} onChange={(e) => setCertificateForm({ ...certificateForm, organization: e.target.value })} /></label>
                      </div>
                      <label><span>Description</span><textarea rows={3} value={certificateForm.description} onChange={(e) => setCertificateForm({ ...certificateForm, description: e.target.value })} /></label>
                      <label><span>Issue date (optional)</span><input value={certificateForm.issueDate} onChange={(e) => setCertificateForm({ ...certificateForm, issueDate: e.target.value })} placeholder="2026 or 2026-06" /></label>
                      <div className="admin-upload">
                        <label className="admin-upload__button"><ImagePlus size={17} /> Upload certificate image<input type="file" accept="image/*" hidden onChange={(e) => upload(e, (url) => setCertificateForm((current) => ({ ...current, imageUrl: url })))} /></label>
                        {certificateForm.imageUrl && <img className="admin-upload__preview" src={certificateForm.imageUrl} alt="Selected certificate preview" />}
                        <button type="button" className="admin-upload__clear" onClick={() => setCertificateForm({ ...certificateForm, imageUrl: '' })}>Remove image</button>
                      </div>
                      <button className="btn btn--primary" type="submit" disabled={busy}><Save size={16} /> {certificateForm.id ? 'Save Changes' : 'Save Certificate'}</button>
                      {certificateForm.id && <button type="button" className="btn btn--ghost" onClick={() => setCertificateForm(emptyCertificate)}>Cancel edit</button>}
                    </form>
                  </div>
                </>
              )}

              {tab === 'services' && (
                <>
                  <div className="admin-content__head">
                    <div><h2>Services</h2><p>Edit the service cards shown to visitors.</p></div>
                    <button type="button" className="btn btn--ghost" onClick={() => { setServiceForm(emptyService); scrollToForm(); }}><Plus size={16} /> New Service</button>
                  </div>
                  <div className="admin-list">
                    {services.map((service) => (
                      <div className="admin-list__row" key={service.id}>
                        <div className="admin-list__info"><strong>{service.title}</strong><span>{service.ctaText}</span></div>
                        <div className="admin-list__actions">
                          <button type="button" className="icon-button" onClick={() => { setServiceForm({ id: service.id, title: service.title, description: service.description, icon: service.icon, ctaText: service.ctaText }); scrollToForm(); }} aria-label={`Edit ${service.title}`}><Pencil size={16} /></button>
                          <button type="button" className="icon-button icon-button--danger" onClick={() => deleteService(service)} aria-label={`Delete ${service.title}`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="admin-form glass-card" ref={formRef}>
                    <h3>{serviceForm.id ? 'Edit service' : 'Add a service'}</h3>
                    <form onSubmit={saveService}>
                      <div className="form-row">
                        <label><span>Service title</span><input required value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} /></label>
                        <label><span>Icon</span><select value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}>
                          {['Sparkles', 'Layout', 'Code', 'Palette', 'ShoppingBag', 'Box', 'Instagram', 'User'].map((icon) => <option key={icon}>{icon}</option>)}
                        </select></label>
                      </div>
                      <label><span>Description</span><textarea rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} /></label>
                      <label><span>Button text</span><input value={serviceForm.ctaText} onChange={(e) => setServiceForm({ ...serviceForm, ctaText: e.target.value })} /></label>
                      <button className="btn btn--primary" type="submit" disabled={busy}><Save size={16} /> {serviceForm.id ? 'Save Changes' : 'Save Service'}</button>
                      {serviceForm.id && <button type="button" className="btn btn--ghost" onClick={() => setServiceForm(emptyService)}>Cancel edit</button>}
                    </form>
                  </div>
                </>
              )}

              {tab === 'messages' && (
                <>
                  <div className="admin-content__head"><div><h2>Messages</h2><p>Contact form submissions are stored here.</p></div></div>
                  {messages.length === 0 ? <p className="empty-state">No messages yet.</p> : (
                    <div className="admin-list">
                      {messages.map((message) => (
                        <div className="admin-message" key={message.id}>
                          <div className="admin-message__head"><strong>{message.name}</strong><span>{message.email}</span></div>
                          <h4>{message.subject}</h4>
                          <p>{message.message}</p>
                          <div className="admin-message__foot">
                            <span>{new Date(message.createdAt).toLocaleString()}</span>
                            <button type="button" className="icon-button icon-button--danger" onClick={async () => {
                              if (!window.confirm('Delete this message?')) return;
                              try { await api.deleteMessage(message.id); setMessages((current) => current.filter((item) => item.id !== message.id)); notify('Message deleted.'); }
                              catch (error) { notify(error instanceof Error ? error.message : 'Could not delete message.', 'error'); }
                            }} aria-label="Delete message"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === 'settings' && (
                <>
                  <div className="admin-content__head"><div><h2>Site settings</h2><p>Contact details and social links shown on the site.</p></div></div>
                  <div className="admin-form glass-card">
                    <form onSubmit={saveSettings}>
                      <div className="form-row">
                        <label><span>Contact email</span><input type="email" value={settingsForm.contactEmail} onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })} /></label>
                        <label><span>GitHub URL</span><input type="url" value={settingsForm.github} onChange={(e) => setSettingsForm({ ...settingsForm, github: e.target.value })} /></label>
                      </div>
                      <div className="form-row">
                        <label><span>LinkedIn URL</span><input type="url" value={settingsForm.linkedin} onChange={(e) => setSettingsForm({ ...settingsForm, linkedin: e.target.value })} /></label>
                        <label><span>Instagram URL</span><input type="url" value={settingsForm.instagram} onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })} /></label>
                      </div>
                      <label><span>X / Twitter URL</span><input type="url" value={settingsForm.twitter} onChange={(e) => setSettingsForm({ ...settingsForm, twitter: e.target.value })} /></label>
                      <button className="btn btn--primary" type="submit" disabled={busy}><Save size={16} /> Save Settings</button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

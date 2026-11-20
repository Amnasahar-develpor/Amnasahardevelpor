import type {
  Certificate,
  ContactMessage,
  Project,
  Service,
  SiteConfig,
  SiteContent,
  SiteSettings,
} from './types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const error = payload as { error?: string } | null;
    throw new Error(error?.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const api = {
  health: () => request<{ ok: boolean }>('/api/health'),
  config: () => request<SiteConfig>('/api/config'),
  content: () => request<SiteContent>('/api/content'),
  session: () => request<{ authenticated: boolean }>('/api/admin/session'),
  login: (password: string) => request<{ ok: boolean }>('/api/admin/login', json('POST', { password })),
  logout: () => request<{ ok: boolean }>('/api/admin/logout', { method: 'POST' }),

  saveProject: (project: Partial<Project>) =>
    request<Project>(project.id ? `/api/admin/projects/${project.id}` : '/api/admin/projects',
      json(project.id ? 'PUT' : 'POST', project)),
  deleteProject: (id: string) => request<{ ok: boolean }>(`/api/admin/projects/${id}`, { method: 'DELETE' }),

  saveCertificate: (certificate: Partial<Certificate>) =>
    request<Certificate>(certificate.id ? `/api/admin/certificates/${certificate.id}` : '/api/admin/certificates',
      json(certificate.id ? 'PUT' : 'POST', certificate)),
  deleteCertificate: (id: string) => request<{ ok: boolean }>(`/api/admin/certificates/${id}`, { method: 'DELETE' }),

  saveService: (service: Partial<Service>) =>
    request<Service>(service.id ? `/api/admin/services/${service.id}` : '/api/admin/services',
      json(service.id ? 'PUT' : 'POST', service)),
  deleteService: (id: string) => request<{ ok: boolean }>(`/api/admin/services/${id}`, { method: 'DELETE' }),

  messages: () => request<ContactMessage[]>('/api/admin/messages'),
  deleteMessage: (id: string) => request<{ ok: boolean }>(`/api/admin/messages/${id}`, { method: 'DELETE' }),
  saveSettings: (settings: SiteSettings) =>
    request<SiteSettings>('/api/admin/settings', json('PUT', settings)),

  uploadImage: async (file: File): Promise<string> => {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.readAsDataURL(file);
    });
    const result = await request<{ url: string }>('/api/admin/upload',
      json('POST', { name: file.name, mime: file.type, data }));
    return result.url;
  },

  contact: (message: { name: string; email: string; subject: string; message: string }) =>
    request<{ ok: boolean; id: string; emailSent: boolean }>('/api/contact', json('POST', message)),
};

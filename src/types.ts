export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  year: string;
  imageUrl: string | null;
  liveUrl: string;
  githubUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificate {
  id: string;
  title: string;
  organization: string;
  description: string;
  issueDate: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaText: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  contactEmail: string;
  github: string;
  linkedin: string;
  instagram: string;
  twitter: string;
}

export interface SiteContent {
  projects: Project[];
  certificates: Certificate[];
  services: Service[];
}

export interface SiteConfig {
  voiceProvider: 'browser' | 'elevenlabs';
  contactEmail: string;
  settings: SiteSettings;
}

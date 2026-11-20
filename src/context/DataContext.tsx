import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import type { Certificate, Project, Service, SiteConfig, SiteSettings } from '../types';

interface DataContextValue {
  projects: Project[];
  certificates: Certificate[];
  services: Service[];
  config: SiteConfig;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  setProjects: (value: Project[]) => void;
  setCertificates: (value: Certificate[]) => void;
  setServices: (value: Service[]) => void;
  setConfig: (value: SiteConfig) => void;
}

const emptyConfig: SiteConfig = {
  voiceProvider: 'browser',
  contactEmail: '',
  settings: { contactEmail: '', github: '', linkedin: '', instagram: '', twitter: '' },
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<SiteConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [content, siteConfig] = await Promise.all([api.content(), api.config()]);
      setProjects(content.projects);
      setCertificates(content.certificates);
      setServices(content.services);
      setConfig(siteConfig);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load portfolio content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      projects,
      certificates,
      services,
      config,
      loading,
      error,
      refresh,
      setProjects,
      setCertificates,
      setServices,
      setConfig,
    }),
    [projects, certificates, services, config, loading, error, refresh],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside DataProvider');
  return context;
}

export function useSettings(): SiteSettings {
  return useData().config.settings;
}

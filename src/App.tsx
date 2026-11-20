import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Certificates from './components/Certificates';
import Services from './components/Services';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function Portfolio() {
  const [adminOpen, setAdminOpen] = useState(false);
  const { error } = useData();

  return (
    <>
      {error && (
        <div className="api-warning" role="alert">
          <AlertTriangle size={16} /> Content service unavailable: {error}
        </div>
      )}
      <Navbar onAdminClick={() => setAdminOpen(true)} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Certificates />
        <Services />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <AdminDashboard open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <Portfolio />
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

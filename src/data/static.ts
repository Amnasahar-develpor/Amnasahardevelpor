import {
  Bot, Box, BrainCircuit, Brush, Code2, Gem, Instagram, Layers3, LayoutTemplate,
  Package, Palette, ScanFace, ShoppingBag, Sparkles, UserRound, WandSparkles,
} from 'lucide-react';

export const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export const roleTags = [
  'AI Developer',
  'Creative Web Developer',
  'Graphic Designer',
  'AI Enthusiast',
  'Digital Creator',
];

export const skills = [
  { title: 'Web Design', icon: LayoutTemplate, detail: 'Elegant, user-focused layouts' },
  { title: 'Website Development', icon: Code2, detail: 'Responsive, production-ready builds' },
  { title: 'Graphic Design', icon: Palette, detail: 'Visual systems and creative assets' },
  { title: 'UI/UX Design', icon: ScanFace, detail: 'Clear, intuitive digital journeys' },
  { title: 'Artificial Intelligence', icon: BrainCircuit, detail: 'Practical intelligent experiences' },
  { title: 'AI Tools', icon: WandSparkles, detail: 'Modern AI-powered workflows' },
  { title: 'Prompt Engineering', icon: Bot, detail: 'Thoughtful prompts for useful output' },
  { title: 'Digital Creativity', icon: Sparkles, detail: 'Ideas brought to life online' },
  { title: 'Branding', icon: Gem, detail: 'Distinctive visual identities' },
  { title: 'Packaging Design', icon: Package, detail: 'Beautiful product presentation' },
  { title: 'E-commerce Website Design', icon: ShoppingBag, detail: 'Stores designed to convert' },
  { title: 'Responsive Design', icon: Layers3, detail: 'Perfect on every screen size' },
];

export const serviceIcons: Record<string, typeof Brush> = {
  Layout: LayoutTemplate,
  Code: Code2,
  Palette,
  ShoppingBag,
  Sparkles,
  Box,
  Instagram,
  User: UserRound,
};

export const projectFallbackCategories = ['AI', 'E-commerce', 'Design', 'Web', 'Portfolio'];

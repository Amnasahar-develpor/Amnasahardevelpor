// Seed content. Only information supplied by Amna is used.
// Empty fields are intentionally left empty rather than invented.

const now = new Date().toISOString();

const projectNames = [
  'ElevenLabs Voice Agent',
  'Milo GPT',
  'MartGlow',
  'Scooter Planet',
  'Snoopy Luxury Dine',
  'Velvet Whimsy Boutique',
  'Luxe Mobile Store',
  'Digital Era House',
  'Social Tax EA',
  'Buttercup Delight',
  'Luxury Bikeya',
];

function seedProjects() {
  return projectNames.map((title, index) => ({
    id: `seed-project-${index + 1}`,
    title,
    description: 'Details for this project can be added in Admin Mode.',
    category: 'Portfolio',
    tags: [],
    year: '',
    imageUrl: null,
    liveUrl: '',
    githubUrl: '',
    createdAt: now,
    updatedAt: now,
  }));
}

const seedServices = [
  ['Website Design', 'Beautiful, responsive website design that reflects your brand and gives visitors a smooth experience.', 'Layout', 'Request a Quote'],
  ['Website Development', 'Clean, reliable front-end and full-stack development for websites that work on every device.', 'Code', 'Request a Quote'],
  ['Graphic Design', 'Thoughtful visual design for digital and print — from social posts to complete brand assets.', 'Palette', 'Request a Quote'],
  ['E-commerce Websites', 'Online store design and development focused on clear product presentation and easy navigation.', 'ShoppingBag', 'Request a Quote'],
  ['AI-Powered Digital Experiences', 'Practical AI integrations and intelligent interfaces that add real value to a website.', 'Sparkles', 'Request a Quote'],
  ['Branding and Packaging Design', 'Cohesive brand visuals and packaging concepts with a polished, memorable look.', 'Box', 'Request a Quote'],
  ['Social Media Designs', 'Scroll-stopping social media creatives designed to keep a consistent visual identity.', 'Instagram', 'Request a Quote'],
  ['Portfolio Website Development', 'Professional portfolio websites that present your work, story and services with clarity.', 'User', 'Request a Quote'],
].map(([title, description, icon, ctaText], index) => ({
  id: `seed-service-${index + 1}`,
  title,
  description,
  icon,
  ctaText,
  createdAt: now,
  updatedAt: now,
}));

export function seedDB() {
  return {
    version: 1,
    projects: seedProjects(),
    certificates: [
      {
        id: 'seed-cert-nyrvex',
        title: 'Nyrvex AI Academy',
        organization: 'Nyrvex AI Academy',
        description: 'Certificate from Nyrvex AI Academy. Further details can be added in Admin Mode.',
        issueDate: '',
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'seed-cert-giaic',
        title: 'GIAIC / Panaversity',
        organization: 'GIAIC / Panaversity',
        description: 'Certificate from GIAIC / Panaversity. Further details can be added in Admin Mode.',
        issueDate: '',
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    services: seedServices,
    messages: [],
    settings: {
      contactEmail: '',
      github: '',
      linkedin: '',
      instagram: '',
      twitter: '',
    },
  };
}

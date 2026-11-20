export class ValidationError extends Error {}

export function text(value, field, { max = 2000, required = false } = {}) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (required && !result) throw new ValidationError(`${field} is required.`);
  if (result.length > max) throw new ValidationError(`${field} must be ${max} characters or fewer.`);
  return result;
}

export function url(value, field) {
  const result = text(value, field, { max: 500 });
  if (!result) return '';
  try {
    const parsed = new URL(result);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
  } catch {
    throw new ValidationError(`${field} must be a valid http(s) URL.`);
  }
  return result;
}

export function tags(value) {
  if (value == null || value === '') return [];
  if (!Array.isArray(value)) throw new ValidationError('Tags must be a list.');
  if (value.length > 12) throw new ValidationError('Use 12 tags or fewer.');
  return value.map((tag) => text(tag, 'Tag', { max: 40 })).filter(Boolean);
}

export function year(value) {
  const result = text(value, 'Year', { max: 4 });
  if (result && !/^\d{4}$/.test(result)) throw new ValidationError('Year must be a 4-digit year.');
  return result;
}

export function imageUrl(value) {
  const result = text(value, 'Image', { max: 500 });
  if (!result) return null;
  if (result.startsWith('/uploads/') && !result.includes('..')) return result;
  return url(result, 'Image URL');
}

export function project(input) {
  return {
    title: text(input?.title, 'Title', { max: 120, required: true }),
    description: text(input?.description, 'Description', { max: 2000 }),
    category: text(input?.category, 'Category', { max: 60 }) || 'Portfolio',
    tags: tags(input?.tags),
    year: year(input?.year),
    imageUrl: imageUrl(input?.imageUrl),
    liveUrl: url(input?.liveUrl, 'Live URL'),
    githubUrl: url(input?.githubUrl, 'GitHub URL'),
  };
}

export function certificate(input) {
  const issueDate = text(input?.issueDate, 'Issue date', { max: 20 });
  if (issueDate && !/^\d{4}(-\d{2})?(-\d{2})?$/.test(issueDate)) {
    throw new ValidationError('Issue date must look like 2025, 2025-06 or 2025-06-01.');
  }
  return {
    title: text(input?.title, 'Title', { max: 120, required: true }),
    organization: text(input?.organization, 'Organization', { max: 120 }),
    description: text(input?.description, 'Description', { max: 2000 }),
    issueDate,
    imageUrl: imageUrl(input?.imageUrl),
  };
}

const allowedIcons = new Set([
  'Layout', 'Code', 'Palette', 'ShoppingBag', 'Sparkles', 'Box', 'Instagram', 'User',
]);

export function service(input) {
  const icon = text(input?.icon, 'Icon', { max: 40 }) || 'Sparkles';
  return {
    title: text(input?.title, 'Title', { max: 120, required: true }),
    description: text(input?.description, 'Description', { max: 1000 }),
    icon: allowedIcons.has(icon) ? icon : 'Sparkles',
    ctaText: text(input?.ctaText, 'Button text', { max: 60 }) || 'Request a Quote',
  };
}

export function message(input) {
  const email = text(input?.email, 'Email', { max: 160, required: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('Please enter a valid email address.');
  }
  const body = text(input?.message, 'Message', { max: 3000, required: true });
  if (body.length < 10) throw new ValidationError('Please write at least 10 characters.');
  return {
    name: text(input?.name, 'Full name', { max: 100, required: true }),
    email,
    subject: text(input?.subject, 'Subject', { max: 150, required: true }),
    message: body,
  };
}

export function settings(input) {
  const result = {};
  for (const key of ['contactEmail', 'github', 'linkedin', 'instagram', 'twitter']) {
    if (input[key] === undefined) continue;
    result[key] = key === 'contactEmail'
      ? text(input[key], 'Contact email', { max: 160 })
      : url(input[key], key);
  }
  if (result.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.contactEmail)) {
    throw new ValidationError('Please enter a valid contact email address.');
  }
  return result;
}

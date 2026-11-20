import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { seedDB } from './seed.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(root, 'data');
export const uploadsDir = path.join(dataDir, 'uploads');
const dbPath = path.join(dataDir, 'db.json');

fs.mkdirSync(uploadsDir, { recursive: true });

function normalise(input) {
  const base = seedDB();
  if (!input || typeof input !== 'object') return base;
  return {
    version: 1,
    projects: Array.isArray(input.projects) ? input.projects : base.projects,
    certificates: Array.isArray(input.certificates) ? input.certificates : base.certificates,
    services: Array.isArray(input.services) ? input.services : base.services,
    messages: Array.isArray(input.messages) ? input.messages : [],
    settings: { ...base.settings, ...(input.settings || {}) },
  };
}

function load() {
  try {
    return normalise(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
  } catch {
    const fresh = seedDB();
    persist(fresh);
    return fresh;
  }
}

function persist(next) {
  const temporary = `${dbPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(next, null, 2), 'utf8');
  fs.renameSync(temporary, dbPath);
}

let database = load();

export function read() {
  return structuredClone(database);
}

export function mutate(mutator) {
  const draft = structuredClone(database);
  const result = mutator(draft);
  persist(draft);
  database = draft;
  return result;
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function saveUpload({ name, mime, data }) {
  const extensionByMime = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };
  const extension = extensionByMime[mime];
  if (!extension) throw new Error('Unsupported image type.');
  const bytes = Buffer.from(data, 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) {
    throw new Error('Image must be smaller than 5 MB.');
  }
  const filename = `${crypto.randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(uploadsDir, filename), bytes);
  return `/uploads/${filename}`;
}

export function deleteUpload(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const filename = path.basename(url);
  if (!filename || filename.includes('..')) return;
  try {
    fs.unlinkSync(path.join(uploadsDir, filename));
  } catch {
    // Already removed — nothing to do.
  }
}

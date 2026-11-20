import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { seedDB } from './seed.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Vercel serverless functions have a read-only, ephemeral filesystem.
export const isServerless = process.env.VERCEL === '1';
export const hasBlob = isServerless && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const storageMode = isServerless ? (hasBlob ? 'vercel-blob' : 'vercel-memory') : 'local-file';

export const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(root, 'data');
export const uploadsDir = path.join(dataDir, 'uploads');
const dbPath = path.join(dataDir, 'db.json');
const blobKey = 'portfolio-data.json';

if (!isServerless) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

function loadFile() {
  try {
    return normalise(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
  } catch {
    const fresh = seedDB();
    persistFile(fresh);
    return fresh;
  }
}

function persistFile(next) {
  const temporary = `${dbPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(next, null, 2), 'utf8');
  fs.renameSync(temporary, dbPath);
}

let database = isServerless ? seedDB() : loadFile();

// ---------------------------------------------------------------------------
// Vercel Blob helpers — loaded only when a token is configured.
// ---------------------------------------------------------------------------

async function listBlobs() {
  const { list } = await import('@vercel/blob');
  return list({ prefix: blobKey, token: process.env.BLOB_READ_WRITE_TOKEN });
}

async function writeBlob(next) {
  const { put, del } = await import('@vercel/blob');
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const existing = await listBlobs();
  for (const blob of existing.blobs) {
    try { await del(blob.url, { token }); } catch { /* ignore stale versions */ }
  }
  await put(blobKey, JSON.stringify(next), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    token,
  });
}

/** Call before handling an API request so every function instance sees latest data. */
export async function refresh() {
  if (!hasBlob) return;
  try {
    const listed = await listBlobs();
    const latest = listed.blobs[0];
    if (!latest) {
      await writeBlob(database);
      return;
    }
    const response = await fetch(latest.url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Blob read failed (${response.status})`);
    database = normalise(await response.json());
  } catch (error) {
    console.warn('Content store refresh failed:', error.message);
  }
}

export function canPersist() {
  return !isServerless || hasBlob;
}

export function read() {
  return structuredClone(database);
}

export async function mutate(mutator) {
  const draft = structuredClone(database);
  const result = mutator(draft);
  database = draft;
  if (hasBlob) await writeBlob(database);
  else if (!isServerless) persistFile(database);
  return result;
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const extensionByMime = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export async function saveUpload({ mime, data }) {
  const extension = extensionByMime[mime];
  if (!extension) throw new Error('Unsupported image type.');
  const bytes = Buffer.from(data, 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) {
    throw new Error('Image must be smaller than 5 MB.');
  }

  if (hasBlob) {
    const { put } = await import('@vercel/blob');
    const result = await put(`uploads/${crypto.randomUUID()}.${extension}`, bytes, {
      access: 'public',
      contentType: mime,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return result.url;
  }
  if (isServerless) {
    throw new Error('Image storage is not configured. Add BLOB_READ_WRITE_TOKEN to Vercel.');
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(uploadsDir, filename), bytes);
  return `/uploads/${filename}`;
}

export async function deleteUpload(url) {
  if (typeof url !== 'string' || !url) return;
  if (hasBlob && url.startsWith('https://')) {
    try {
      const { del } = await import('@vercel/blob');
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch { /* already gone */ }
    return;
  }
  if (!url.startsWith('/uploads/')) return;
  const filename = path.basename(url);
  if (!filename || filename.includes('..')) return;
  try {
    fs.unlinkSync(path.join(uploadsDir, filename));
  } catch { /* already gone */ }
}

import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADMIN_PASSWORD,
  cookieOptions,
  checkPassword,
  createSession,
  loginAllowed,
  readCookie,
  resetAttempts,
  requireAdmin,
  verifySession,
} from './auth.js';
import { mutate, newId, read, saveUpload, deleteUpload, dataDir, uploadsDir } from './store.js';
import {
  ValidationError,
  certificate as validateCertificate,
  message as validateMessage,
  project as validateProject,
  service as validateService,
  settings as validateSettings,
} from './validate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = express();
const port = Number(process.env.PORT) || 3001;

app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ---------------------------------------------------------------------------
// Public content
// ---------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'amna-sahar-portfolio' });
});

app.get('/api/config', (_req, res) => {
  const db = read();
  res.json({
    voiceProvider: process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'browser',
    contactEmail: db.settings.contactEmail || process.env.CONTACT_EMAIL || '',
    settings: db.settings,
  });
});

app.get('/api/content', (_req, res) => {
  const db = read();
  res.json({
    projects: db.projects,
    certificates: db.certificates,
    services: db.services,
  });
});

app.get('/api/admin/session', (req, res) => {
  res.json({ authenticated: verifySession(readCookie(req.headers.cookie, 'amna_admin')) });
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const gate = loginAllowed(ip);
  if (!gate.allowed) {
    return res.status(429).json({ error: `Too many attempts. Try again in ${gate.retryAfter} seconds.` });
  }
  if (!checkPassword(req.body?.password)) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }
  resetAttempts(ip);
  res.cookie('amna_admin', createSession(), cookieOptions);
  return res.json({ ok: true });
});

app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie('amna_admin', { path: '/' });
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function upsert(collection, payload, validator) {
  const clean = validator(payload);
  return mutate((db) => {
    const now = new Date().toISOString();
    if (payload.id) {
      const index = db[collection].findIndex((item) => item.id === payload.id);
      if (index === -1) throw new ValidationError('Item not found.');
      db[collection][index] = { ...db[collection][index], ...clean, updatedAt: now };
      return db[collection][index];
    }
    const item = { id: newId(collection.slice(0, -1)), ...clean, createdAt: now, updatedAt: now };
    db[collection].unshift(item);
    return item;
  });
}

function remove(collection, id) {
  const removed = mutate((db) => {
    const index = db[collection].findIndex((item) => item.id === id);
    if (index === -1) throw new ValidationError('Item not found.');
    const [item] = db[collection].splice(index, 1);
    return item;
  });
  if (removed?.imageUrl?.startsWith('/uploads/')) deleteUpload(removed.imageUrl);
  return removed;
}

// ---------------------------------------------------------------------------
// Admin: projects, certificates, services, messages, settings
// ---------------------------------------------------------------------------

app.post('/api/admin/projects', requireAdmin, (req, res) => {
  res.status(201).json(upsert('projects', req.body, validateProject));
});

app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
  res.json(upsert('projects', { ...req.body, id: req.params.id }, validateProject));
});

app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  remove('projects', req.params.id);
  res.json({ ok: true });
});

app.post('/api/admin/certificates', requireAdmin, (req, res) => {
  res.status(201).json(upsert('certificates', req.body, validateCertificate));
});

app.put('/api/admin/certificates/:id', requireAdmin, (req, res) => {
  res.json(upsert('certificates', { ...req.body, id: req.params.id }, validateCertificate));
});

app.delete('/api/admin/certificates/:id', requireAdmin, (req, res) => {
  remove('certificates', req.params.id);
  res.json({ ok: true });
});

app.post('/api/admin/services', requireAdmin, (req, res) => {
  res.status(201).json(upsert('services', req.body, validateService));
});

app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  res.json(upsert('services', { ...req.body, id: req.params.id }, validateService));
});

app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
  remove('services', req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/messages', requireAdmin, (_req, res) => {
  res.json(read().messages);
});

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  mutate((db) => {
    const index = db.messages.findIndex((item) => item.id === req.params.id);
    if (index === -1) throw new ValidationError('Message not found.');
    db.messages.splice(index, 1);
  });
  res.json({ ok: true });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const clean = validateSettings(req.body || {});
  const settings = mutate((db) => {
    db.settings = { ...db.settings, ...clean };
    return db.settings;
  });
  res.json(settings);
});

app.post('/api/admin/upload', requireAdmin, (req, res) => {
  try {
    const { name, mime, data } = req.body || {};
    if (typeof data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(data)) {
      throw new ValidationError('Invalid image data.');
    }
    if (typeof mime !== 'string' || !mime.startsWith('image/')) {
      throw new ValidationError('Please choose an image file.');
    }
    const url = saveUpload({ name, mime, data });
    res.status(201).json({ url });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
    return res.status(400).json({ error: error.message || 'Upload failed.' });
  }
});

// ---------------------------------------------------------------------------
// Contact form — always stored, optionally emailed
// ---------------------------------------------------------------------------

const contactLimiter = new Map();

app.post('/api/contact', async (req, res, next) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = contactLimiter.get(ip);
    if (record && now < record.resetAt && record.count >= 20) {
      return res.status(429).json({ error: 'Please wait a moment before sending another message.' });
    }
    if (!record || now > record.resetAt) {
      contactLimiter.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    } else {
      record.count += 1;
    }

    const clean = validateMessage(req.body);
    const saved = mutate((db) => {
      const item = {
        id: newId('message'),
        ...clean,
        read: false,
        createdAt: new Date().toISOString(),
      };
      db.messages.unshift(item);
      return item;
    });

    let emailSent = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = await import('nodemailer');
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transport.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: read().settings.contactEmail || process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          replyTo: saved.email,
          subject: `Portfolio enquiry: ${saved.subject}`,
          text: `${saved.name} (${saved.email})\n\n${saved.message}`,
        });
        emailSent = true;
      } catch (error) {
        console.warn('Contact email could not be sent:', error.message);
      }
    }

    return res.status(201).json({ ok: true, id: saved.id, emailSent });
  } catch (error) {
    return next(error);
  }
});

// ---------------------------------------------------------------------------
// Optional premium voice (ElevenLabs). Falls back to browser speech on client.
// ---------------------------------------------------------------------------

const voiceLimiter = new Map();

app.post('/api/voice/speak', async (req, res, next) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
      return res.status(501).json({ error: 'Premium voice is not configured.' });
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = voiceLimiter.get(ip);
    if (!record || now > record.resetAt) {
      voiceLimiter.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    } else {
      record.count += 1;
      if (record.count > 60) {
        return res.status(429).json({ error: 'Voice limit reached for this hour.' });
      }
    }

    const textValue = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!textValue || textValue.length > 700) {
      return res.status(400).json({ error: 'Invalid speech text.' });
    }
    const voiceId = encodeURIComponent(process.env.ELEVENLABS_VOICE_ID);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: textValue,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.45, similarity_boost: 0.75 },
        }),
      },
    );
    if (!response.ok) {
      return res.status(502).json({ error: 'Voice service is unavailable right now.' });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(audio);
  } catch (error) {
    return next(error);
  }
});

// ---------------------------------------------------------------------------
// Static files and SPA fallback
// ---------------------------------------------------------------------------

app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', fallthrough: false }));

const dist = path.join(root, 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.get('*', (_req, res) => {
    res.status(200).send(
      'API is running. Run `npm run dev` to open the site, or `npm run build` to serve the production site from this server.',
    );
  });
}

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Invalid request body.' });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(port, () => {
  console.log(`Amna Sahar portfolio server listening on http://localhost:${port}`);
  console.log(`Data directory: ${dataDir}`);
  console.log(`Admin password source: ${process.env.ADMIN_PASSWORD ? 'ADMIN_PASSWORD env' : 'default (12345)'}`);
});

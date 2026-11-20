import crypto from 'node:crypto';

const secret = process.env.SESSION_SECRET || 'amna-portfolio-local-development-secret-change-me';
const sessionHours = 8;
const maxAttempts = 8;
const windowMs = 15 * 60 * 1000;

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345';
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
  maxAge: sessionHours * 60 * 60 * 1000,
};

const attempts = new Map();

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signature(payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSession() {
  const payload = base64url(
    JSON.stringify({ role: 'admin', exp: Date.now() + sessionHours * 60 * 60 * 1000 }),
  );
  return `${payload}.${signature(payload)}`;
}

export function verifySession(token) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, received] = token.split('.');
  const expected = signature(payload);
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(candidate) {
  if (typeof candidate !== 'string') return false;
  const a = crypto.createHash('sha256').update(candidate).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

export function readCookie(header, name) {
  if (!header) return null;
  const match = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function loginAllowed(ip) {
  const record = attempts.get(ip);
  const now = Date.now();
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  if (record.count >= maxAttempts) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

export function resetAttempts(ip) {
  attempts.delete(ip);
}

export function requireAdmin(req, res, next) {
  const token = readCookie(req.headers.cookie, 'amna_admin');
  if (!verifySession(token)) {
    return res.status(401).json({ error: 'Admin session required. Please sign in again.' });
  }
  return next();
}

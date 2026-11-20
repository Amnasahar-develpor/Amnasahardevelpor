// Verifies the Vercel catch-all functions handle URLs with/without /api prefix
// at both single and nested depths.
import http from 'node:http';
import assert from 'node:assert/strict';
import rootHandler from '../api/[...path].js';
import adminHandler from '../api/admin/[...path].js';
import voiceHandler from '../api/voice/[...path].js';

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/admin/')) return adminHandler(req, res);
  if (req.url.startsWith('/voice/')) return voiceHandler(req, res);
  return rootHandler(req, res);
});
await new Promise((resolve) => server.listen(3004, resolve));

for (const path of [
  '/api/content',
  '/content',
  '/api/config',
  '/config',
  '/api/health',
  '/api/admin/session',
  '/admin/session',
]) {
  const response = await fetch(`http://localhost:3004${path}`);
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  const body = await response.json();
  console.log(`${path} -> ${response.status}`, Object.keys(body).join(', '));
}

// Voice without keys must return a controlled 501, not a 404.
const voice = await fetch('http://localhost:3004/api/voice/speak', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'hello' }),
});
assert.equal(voice.status, 501);
console.log('/api/voice/speak -> 501 (graceful, not 404)');

await new Promise((resolve) => server.close(resolve));
console.log('Vercel route test passed.');

// Verifies the Vercel catch-all function handles URLs with or without /api.
import http from 'node:http';
import assert from 'node:assert/strict';
import handler from '../api/[...path].js';

const server = http.createServer((req, res) => handler(req, res));
await new Promise((resolve) => server.listen(3004, resolve));

for (const path of ['/api/content', '/content', '/api/config', '/config', '/api/health']) {
  const response = await fetch(`http://localhost:3004${path}`);
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  const body = await response.json();
  console.log(`${path} -> ${response.status}`, Object.keys(body).join(', '));
}

await new Promise((resolve) => server.close(resolve));
console.log('Vercel route test passed.');

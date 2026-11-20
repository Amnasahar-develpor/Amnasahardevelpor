// API smoke test. Start the server first: npm start (or npm run dev:server).
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:3001';
let cookie = '';
const password = process.env.ADMIN_PASSWORD || '12345';

async function call(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
  });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

const health = await call('/api/health');
assert.equal(health.status, 200, 'health endpoint');

const denied = await call('/api/admin/projects', {
  method: 'POST',
  body: JSON.stringify({ title: 'Should fail' }),
});
assert.equal(denied.status, 401, 'unauthenticated write must be blocked');

const login = await call('/api/admin/login', {
  method: 'POST',
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200, `login failed: ${JSON.stringify(login.body)}`);

// Make the test idempotent by removing leftovers from a previous interrupted run.
const existing = await call('/api/content');
for (const project of existing.body.projects.filter((item) => item.title.startsWith('Smoke Test Project'))) {
  await call(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
}
for (const certificate of existing.body.certificates.filter((item) => item.title === 'Smoke Test Certificate')) {
  await call(`/api/admin/certificates/${certificate.id}`, { method: 'DELETE' });
}
const oldMessages = await call('/api/admin/messages');
for (const item of oldMessages.body.filter((entry) => entry.email === 'visitor@example.com')) {
  await call(`/api/admin/messages/${item.id}`, { method: 'DELETE' });
}

const created = [];
for (let index = 1; index <= 5; index += 1) {
  const result = await call('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: `Smoke Test Project ${index}`,
      description: 'Temporary project created by the API smoke test.',
      category: 'Test',
      tags: ['test', `number-${index}`],
      year: '2026',
      liveUrl: 'https://example.com',
    }),
  });
  assert.equal(result.status, 201, `create project ${index}: ${JSON.stringify(result.body)}`);
  created.push(result.body.id);
}

const edited = await call(`/api/admin/projects/${created[0]}`, {
  method: 'PUT',
  body: JSON.stringify({ title: 'Smoke Test Project 1 — Edited', category: 'Test' }),
});
assert.equal(edited.status, 200, 'edit project');
assert.equal(edited.body.title, 'Smoke Test Project 1 — Edited');

const content = await call('/api/content');
assert.ok(content.body.projects.length >= 16, 'projects must be publicly visible');

const certificate = await call('/api/admin/certificates', {
  method: 'POST',
  body: JSON.stringify({ title: 'Smoke Test Certificate', organization: 'Test Org', description: 'Temporary test entry.' }),
});
assert.equal(certificate.status, 201, 'create certificate');

const message = await call('/api/contact', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test Visitor', email: 'visitor@example.com', subject: 'Test', message: 'This is a smoke test message.' }),
});
assert.equal(message.status, 201, 'contact submission');
assert.equal(message.body.ok, true);

for (const id of created) {
  const result = await call(`/api/admin/projects/${id}`, { method: 'DELETE' });
  assert.equal(result.status, 200, 'delete project');
}
await call(`/api/admin/certificates/${certificate.body.id}`, { method: 'DELETE' });
const messages = await call('/api/admin/messages');
for (const item of messages.body.filter((entry) => entry.email === 'visitor@example.com')) {
  await call(`/api/admin/messages/${item.id}`, { method: 'DELETE' });
}

console.log('API smoke test passed: auth, 5 project adds, edit, public visibility, certificate, contact, deletes.');

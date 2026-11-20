// End-to-end browser check using the locally installed Edge/Chromium executable.
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:3001';
const executablePath = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('dialog', (dialog) => dialog.accept());

await page.goto(base, { waitUntil: 'networkidle' });
await page.locator('.hero__title').waitFor();
assert.match(await page.locator('.hero__title').innerText(), /AI DEVELOPER/i);
await page.locator('.character-canvas svg').waitFor();
console.log('Avatar SVG elements:', await page.locator('.character-canvas svg').count());
assert.ok(await page.locator('.project-card').count() >= 11, 'seeded projects render');
assert.ok(await page.locator('.skill-card').count() === 12, '12 skill cards render');
assert.ok(await page.locator('.certificate-card').count() === 2, '2 certificates render');

// Theme toggle and persistence.
const toggle = page.getByRole('button', { name: /Switch to dark mode/i });
await toggle.click();
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
await page.reload({ waitUntil: 'networkidle' });
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'theme persists after refresh');
await page.getByRole('button', { name: /Switch to light mode/i }).click();

// Admin sign-in and project CRUD through the actual UI.
await page.getByRole('button', { name: /Admin Mode/i }).click();
await page.locator('.admin-login input[type="password"]').fill('12345');
await page.getByRole('button', { name: 'Sign In' }).click();
await page.locator('.admin-content h2').waitFor();
await page.getByRole('button', { name: /New Project/i }).click();
const form = page.locator('.admin-form');
await form.locator('input').nth(0).fill('UI Check Project');
await form.locator('textarea').fill('Created by the automated browser check.');
await form.locator('input').nth(1).fill('Test');
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
);
await form.locator('input[type="file"]').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: tinyPng });
await form.locator('.admin-upload__preview').waitFor();
await form.getByRole('button', { name: /Save Project/i }).click();
await page.locator('.toast', { hasText: 'Project added' }).waitFor();
await page.getByRole('button', { name: 'Close admin dashboard' }).click();
await page.locator('.project-card', { hasText: 'UI Check Project' }).waitFor();
assert.ok(
  await page.locator('.project-card', { hasText: 'UI Check Project' }).locator('img[src^="/uploads/"]').count() === 1,
  'uploaded image is published',
);

// Delete it again through Admin Mode.
await page.getByRole('button', { name: /Admin Dashboard/i }).click();
const row = page.locator('.admin-list__row', { hasText: 'UI Check Project' });
await row.getByRole('button', { name: /Delete UI Check Project/i }).click();
await page.locator('.toast', { hasText: 'Project deleted' }).waitFor();
await page.getByRole('button', { name: 'Close admin dashboard' }).click();

// Contact form — success only after server persistence.
await page.locator('#contact').scrollIntoViewIfNeeded();
await page.getByPlaceholder('Your full name').fill('Browser Check');
await page.getByPlaceholder('you@example.com').fill('browser@example.com');
await page.getByPlaceholder('What would you like to discuss?').fill('UI check');
await page.getByPlaceholder('Tell me about your project…').fill('This message is sent by the automated browser check.');
await page.getByRole('button', { name: /Send Message/i }).click();
await page.locator('.form-feedback', { hasText: 'submitted and saved' }).waitFor();

await page.screenshot({ path: 'ui-check-desktop.png', fullPage: false });

// Mobile layout and menu.
await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Open menu' }).click();
await page.locator('.nav-links--open').waitFor({ state: 'visible' });

// Remove the contact message created above so repeated runs keep data clean.
const login = await fetch(`${base}/api/admin/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '12345' }),
});
const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
const messages = await (await fetch(`${base}/api/admin/messages`, { headers: { Cookie: cookie } })).json();
for (const item of messages.filter((entry) => entry.email === 'browser@example.com')) {
  await fetch(`${base}/api/admin/messages/${item.id}`, { method: 'DELETE', headers: { Cookie: cookie } });
}

await browser.close();

if (pageErrors.length) {
  console.error('Page errors:', pageErrors);
  process.exitCode = 1;
} else {
  console.log('UI check passed: rendering, theme persistence, admin CRUD, contact submission, mobile menu.');
}
if (consoleErrors.length) console.log('Console errors (review):', consoleErrors.slice(0, 10));

# Amna Sahar — AI Developer & Creative Web Developer Portfolio

A complete, production-ready portfolio with a premium lavender design system, a genuine real-time
3D AI assistant with voice, full light/dark themes, a public projects gallery, and a password-protected
admin dashboard that publishes changes to all visitors.

---

## 1. What is included

| Feature | Implementation |
| --- | --- |
| Side-by-side hero | Text on the left, interactive 3D assistant on the right; stacks neatly on mobile |
| 3D AI assistant | Real Three.js character with idle motion, blinking, hand waving, speaking mouth and gestures |
| Voice assistant | Browser Speech Synthesis + Speech Recognition (no key required), optional ElevenLabs neural voice |
| Guided introduction | “Talk to My AI Assistant” explains identity, skills, projects, certificates, services and contact |
| Question answering | Typed or spoken questions answered from the actual portfolio data |
| Voice controls | Start, stop, replay and mute/unmute |
| Themes | Full light/dark system for every section, card, form and menu; saved in `localStorage` |
| Navigation | Responsive nav with mobile menu and smooth section scrolling |
| Sections | About, 12 skill cards, certificates, 8 services, filterable project gallery, contact form |
| Admin Mode | HTTP-only signed session cookie, server-side validation, CRUD for projects/certificates/services/settings, uploads, message inbox |
| Persistence | Server-side JSON database + uploaded images in `DATA_DIR` — changes appear publicly immediately |
| Contact form | Validated client and server side; submissions stored permanently, optional SMTP email |
| Build | TypeScript + Vite production build, Express serves the built site and API from one process |

No invented qualifications, dates, credential IDs or project links are included. Empty fields are
stored as empty and displayed honestly. The 11 supplied project names are seeded; Amna can add the
remaining projects and all details in Admin Mode. There is no artificial project limit — the gallery
was tested with 5 additional projects added through Admin Mode.

---

## 2. Requirements

- Node.js **20.19+** (Node 22 LTS recommended)
- npm 10+
- A hosting environment with a **persistent disk/volume** for `DATA_DIR` if Admin Mode must survive redeploys

---

## 3. Local installation

```bash
git clone <your-repository-url> amna-sahar-portfolio
cd amna-sahar-portfolio
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Run the full development environment (Vite on port 5173 + API on port 3001):

```bash
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` and `/uploads` to the Express server.

Production build and single-server run:

```bash
npm run build
npm start
```

Open **http://localhost:3001** — the Express server serves `dist/` and the API together.

---

## 4. Admin Mode

1. Click **Admin Mode** in the navigation bar.
2. Sign in with the configured admin password. The default password is `12345`.
3. Add, edit or delete projects, certificates and services; upload images; manage contact/social
   settings; read and delete contact messages.

Security notes:

- The password is never sent to the browser; only a salted-direction HMAC session token is stored
  in an `HttpOnly`, `SameSite=Lax` cookie (8 hours).
- Every admin endpoint verifies the session on the server. Hiding the button is **not** the security
  mechanism.
- Login is rate-limited (8 attempts / 15 minutes per IP).
- Set `SESSION_SECRET` to a long random string before deploying. Set `ADMIN_PASSWORD` to a private
  value. Set `COOKIE_SECURE=true` when serving over HTTPS.
- Uploads are restricted to PNG/JPEG/WebP/GIF/AVIF and 5 MB, validated on the server.

---

## 5. Environment variables

Copy `.env.example` to `.env`. All variables are optional for local use.

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API/production server port | `3001` |
| `DATA_DIR` | Persistent JSON database + upload folder | `./data` |
| `ADMIN_PASSWORD` | Admin Mode password | `12345` |
| `SESSION_SECRET` | Signs admin session cookies | development fallback — **change it** |
| `COOKIE_SECURE` | Send cookie only over HTTPS | `false` |
| `CONTACT_EMAIL` | Fallback contact email | empty |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional emailed contact notifications | unset |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | Optional premium neural voice | unset |

Express does not auto-load `.env`. On hosting platforms add variables in the dashboard. For local
`npm start` with a `.env` file, use `node --env-file=.env server/index.js` (Node 20+).

### AI voice explained

- With no API key, the assistant uses the browser's built-in **Speech Synthesis** (female voice is
  preferred when the OS offers one) and **Speech Recognition** for spoken questions. Chrome and Edge
  have the best support; voice quality depends on the visitor's operating system. This is real,
  working voice output — not a visual mockup.
- With `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`, `/api/voice/speak` proxies ElevenLabs
  `eleven_multilingual_v2` audio server-side and the client plays it. If that request fails, it
  automatically falls back to browser speech. The key is never exposed to the browser. Voice requests
  are rate-limited per IP (60/hour) because the API is metered.
- Muting stops audio output but keeps the animated speaking/gesture feedback and visible text.

### Contact form explained

A “success” message is only shown after the server has stored the submission in `DATA_DIR/db.json`.
If SMTP is configured, an email is also attempted; if email delivery fails, the message is still
saved and the response reports `emailSent: false`. Nothing is faked.

---

## 6. Deployment

### Recommended — Docker / Render / Railway / Fly.io (persistent disk required)

The repository includes `Dockerfile` and `render.yaml`.

Render blueprint:

1. Push the repository to GitHub.
2. In Render, choose **Blueprint → New Blueprint Instance** and select the repository.
3. Set `ADMIN_PASSWORD`; `SESSION_SECRET` is generated automatically.
4. Deploy. The blueprint builds the site, runs `npm ci --omit=dev`, mounts `/app/data` as a
   persistent disk and starts the server on port 3001.

Railway / Fly.io:

1. Build locally with `npm run build`.
2. Deploy the folder with the provided `Dockerfile`.
3. Attach a volume at `/app/data` and set `DATA_DIR=/app/data`.
4. Set `ADMIN_PASSWORD`, `SESSION_SECRET=...`, `COOKIE_SECURE=true`.

Any standard Node host works as long as it runs `npm run build` then `npm start` and provides a
persistent volume for `DATA_DIR`.

### Vercel (fully supported)

The project includes a Vercel serverless API at `api/[...path].js`, so `/api/content`,
`/api/config`, `/api/contact` and every Admin Mode route work in production — no separate server
is needed. `vercel.json` configures the Vite build.

1. Import the repository into Vercel. It detects Vite; `vercel.json` sets the build command and `dist` output.
2. Set these environment variables in **Vercel → Project Settings → Environment Variables**:
   - `SESSION_SECRET` — a long random string (signs the admin cookie).
   - `ADMIN_PASSWORD` — your private admin password.
   - `BLOB_READ_WRITE_TOKEN` — **required for Admin Mode and the contact form**. Create a store at
     **Vercel → Storage → Create Database → Blob**, then copy its token here.
   - Optional: `CONTACT_EMAIL`, SMTP variables, `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`.
3. Redeploy. The public gallery loads from the serverless API and the “Content service unavailable”
   banner disappears. Projects, certificates, services, images and messages persist in Vercel Blob.

If `BLOB_READ_WRITE_TOKEN` is missing, the public site still works from the seeded content, but
Admin Mode write actions and the contact form return a clear `503` message instead of falsely
reporting success.

### Netlify note

Netlify needs the same serverless API pattern. The Express app in `server/app.js` can be wrapped with
`serverless-http` in a Netlify function, and `server/store.js` can be pointed at Netlify Blobs using
the same `refresh()` / `mutate()` interface. No frontend changes are required.

---

## 7. Project structure

```
amna-sahar-portfolio/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── Dockerfile
├── render.yaml
├── vercel.json        # Vercel Vite build + serverless function config
├── api/
│   └── [...path].js   # Vercel catch-all serverless API (wraps server/app.js)
├── server/
│   ├── index.js       # local/Node entry point (starts the HTTP listener)
│   ├── app.js         # Express app with every API route (shared by Node + Vercel)
│   ├── store.js       # JSON file locally / Vercel Blob in production
│   ├── seed.js        # factual seed content (no invented details)
│   ├── auth.js        # session signing, password check, rate limit
│   └── validate.js    # server-side validation for every write
├── src/
│   ├── App.tsx
│   ├── api.ts
│   ├── types.ts
│   ├── components/    # Navbar, Hero, Assistant3D, AssistantPanel, sections, AdminDashboard…
│   ├── context/       # Theme, data, auth and toast providers
│   ├── hooks/useAssistant.ts
│   └── styles/        # global.css, layout.css, components.css
├── public/
│   └── favicon.svg
├── data/              # created automatically: db.json + uploads/
└── scripts/smoke-test.mjs
```

---

## 8. Verification

```bash
npm run build          # TypeScript check + Vite production build
npm start              # in another terminal
npm run test:api       # auth, 5 project adds, edit, public visibility, certificate, contact, deletes
npm run test:ui        # browser check: 3D canvas, themes, admin CRUD, uploads, contact, mobile menu
npm run test:vercel    # verifies the /api catch-all function in Vercel mode
```

The smoke tests create and remove their own test records, leaving the portfolio data unchanged.
`test:ui` uses a locally installed Microsoft Edge; set `EDGE_PATH` if Edge is installed elsewhere.

Manual checklist: navigation links, mobile menu, theme toggle + refresh persistence, hero buttons,
Talk to Assistant, question input, voice input, start/stop/replay/mute, category filters, View Project,
service quote links, contact validation and submission, admin sign-in, add/edit/delete project,
image upload, add/edit certificate, edit service, settings save.

---

## 9. Adding your real details

Use **Admin Mode → Settings** for your email and social links, and Admin Mode → Projects / Certificates
for images, dates, descriptions and URLs. Seeded entries with missing information deliberately show
“Not specified” or a short note instead of invented content.

If you would like to use a rendered character portrait as a WebGL fallback instead of the built-in
3D scene, place an optimised image at `public/assistant-portrait.png` and update
`src/components/Assistant3D.tsx` — the 3D assistant itself needs no external asset.

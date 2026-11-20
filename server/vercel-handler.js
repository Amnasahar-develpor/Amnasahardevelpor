import app from './app.js';

// Vercel may pass URLs with or without the /api prefix depending on the
// catch-all route depth. Normalise before handing the request to Express.
function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}

export default handler;

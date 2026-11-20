import app from '../server/app.js';

// Vercel routes /api/* here. In some runtimes req.url arrives without the
// /api prefix, so normalise it before handing the request to Express.
function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}

export default handler;

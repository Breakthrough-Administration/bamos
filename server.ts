import { createServer } from 'http';
import { parse } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import next from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasCompleteBuild =
  fs.existsSync(path.join(__dirname, '.next', 'routes-manifest.json')) &&
  fs.existsSync(path.join(__dirname, '.next', 'server', 'app-paths-manifest.json')) &&
  fs.existsSync(path.join(__dirname, '.next', 'build-manifest.json'));

const dev = process.env.NODE_ENV !== 'production' || !hasCompleteBuild;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({
  dev,
  hostname,
  port,
  dir: __dirname,
});

let handle = app.getRequestHandler();
let isReady = false;

// Prepare Next.js app in background
const preparePromise = app
  .prepare()
  .then(() => {
    isReady = true;
    console.log(`> Next.js prepared successfully (dev=${dev})`);
  })
  .catch((err) => {
    console.error('Error during app.prepare():', err);
    if (!dev) {
      console.warn('Falling back to on-demand dev mode...');
      const fallbackApp = next({ dev: true, hostname, port, dir: __dirname });
      handle = fallbackApp.getRequestHandler();
      return fallbackApp.prepare().then(() => {
        isReady = true;
        console.log('> Fallback Next.js ready');
      });
    }
  });

// Start HTTP server immediately to satisfy Cloud Run deployment health checks
const server = createServer(async (req, res) => {
  const url = req.url || '/';

  // Fast-path health check endpoint for Cloud Run readiness & liveness probes
  if (url === '/_health' || url === '/healthz' || url === '/ping') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.end(JSON.stringify({ status: 'healthy', ready: isReady, uptime: process.uptime() }));
    return;
  }

  try {
    if (!isReady) {
      // Await preparation if not yet ready
      await preparePromise;
    }
    const parsedUrl = parse(url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error occurred handling', url, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('internal server error');
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`> Server listening on http://${hostname}:${port} (dev=${dev})`);
});


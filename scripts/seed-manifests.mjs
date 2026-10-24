import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const serverDir = path.join(nextDir, 'server');

// Ensure .next and .next/server directories exist
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

// 1. Ensure app-paths-manifest.json exists
const appPathsManifestPath = path.join(serverDir, 'app-paths-manifest.json');
if (!fs.existsSync(appPathsManifestPath)) {
  const defaultAppPaths = {
    '/page': 'app/page.js',
    '/portal/page': 'app/portal/page.js',
    '/callback/page': 'app/callback/page.js',
    '/not-found': 'app/not-found.js',
    '/api/health/route': 'app/api/health/route.js',
    '/api/chat/route': 'app/api/chat/route.js',
  };
  fs.writeFileSync(appPathsManifestPath, JSON.stringify(defaultAppPaths, null, 2), 'utf8');
}

// 2. Ensure routes-manifest.json exists
const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
if (!fs.existsSync(routesManifestPath)) {
  const defaultRoutes = {
    version: 3,
    pages404: true,
    caseSensitive: false,
    basePath: '',
    redirects: [],
    headers: [],
    dynamicRoutes: [],
    staticRoutes: [
      { page: '/', regex: '^/(?:/)?$', routeKeys: {}, namedRegex: '^/(?:/)?$' },
      { page: '/portal', regex: '^/portal(?:/)?$', routeKeys: {}, namedRegex: '^/portal(?:/)?$' },
      { page: '/callback', regex: '^/callback(?:/)?$', routeKeys: {}, namedRegex: '^/callback(?:/)?$' },
    ],
    dataRoutes: [],
    rsc: {
      header: 'RSC',
      varyHeader: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch',
      prefetchHeader: 'Next-Router-Prefetch',
    },
    rewrites: {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    },
  };
  fs.writeFileSync(routesManifestPath, JSON.stringify(defaultRoutes, null, 2), 'utf8');
}

// 3. Ensure build-manifest.json exists
const buildManifestPath = path.join(nextDir, 'build-manifest.json');
if (!fs.existsSync(buildManifestPath)) {
  const defaultBuildManifest = {
    polyfillFiles: [],
    devFiles: [],
    ampDevFiles: [],
    lowPriorityFiles: [],
    rootMainFiles: [],
    pages: {
      '/_app': [],
      '/_error': [],
    },
    ampFirstPages: [],
  };
  fs.writeFileSync(buildManifestPath, JSON.stringify(defaultBuildManifest, null, 2), 'utf8');
}

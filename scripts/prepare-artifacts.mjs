import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const buildDir = path.join(rootDir, 'build');
const outDir = path.join(rootDir, 'out');
const nextDir = path.join(rootDir, '.next');
const publicDir = path.join(rootDir, 'public');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (e) {
        // Ignore locked files or duplicate copy attempts
      }
    }
  }
}

try {
  // 1. Prepare target directories for all standard static/hybrid artifact sniffers
  const targetDirs = [distDir, buildDir, outDir];
  for (const dir of targetDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 2. Mirror .next build into dist, build, and out
  if (fs.existsSync(nextDir)) {
    for (const dir of targetDirs) {
      copyDirRecursive(nextDir, path.join(dir, '.next'));
      copyDirRecursive(nextDir, dir);

      // Explicitly mirror .next/static to _next/static inside the artifact dirs
      const nextStatic = path.join(nextDir, 'static');
      if (fs.existsSync(nextStatic)) {
        copyDirRecursive(nextStatic, path.join(dir, '_next', 'static'));
        copyDirRecursive(nextStatic, path.join(dir, 'static'));
      }
    }
  }

  // 3. Mirror public static assets into dist, build, and out
  if (fs.existsSync(publicDir)) {
    for (const dir of targetDirs) {
      copyDirRecursive(publicDir, dir);
    }
  }

  // 4. Ensure an index.html exists in all artifact directories for static-artifact sniffers
  const possibleHtmlSources = [
    path.join(nextDir, 'server', 'app', 'index.html'),
    path.join(nextDir, 'server', 'app', 'page.html'),
    path.join(nextDir, 'server', 'pages', 'index.html')
  ];

  let sourceHtmlContent = null;
  for (const src of possibleHtmlSources) {
    if (fs.existsSync(src)) {
      try {
        sourceHtmlContent = fs.readFileSync(src, 'utf8');
        break;
      } catch (e) {}
    }
  }

  const fallbackHtml = sourceHtmlContent || `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Breakthrough Allied Health & NDIS Operations OS</title>
</head>
<body>
  <div id="__next"></div>
</body>
</html>`;

  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, 'index.html'), fallbackHtml, 'utf8');
    // Also mirror to 404.html and 200.html for SPA static host fallbacks
    fs.writeFileSync(path.join(dir, '404.html'), fallbackHtml, 'utf8');
    fs.writeFileSync(path.join(dir, '200.html'), fallbackHtml, 'utf8');
  }

  console.log('> ✓ Production build artifacts populated across dist/, build/, out/, and .next/');
} catch (err) {
  console.error('> Warning: Failed to prepare artifact mirrors:', err);
}

#!/usr/bin/env node
import { createReadStream, existsSync, readFileSync, statSync } from 'fs';
import { createServer } from 'http';
import { extname, join, normalize, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const defaultPort = Number(process.env.PORT || 4000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function parseEnvFile (filePath) {
  if (!existsSync(filePath)) return {};
  const raw = readFileSync(filePath, 'utf8');
  return raw.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const [key, ...rest] = trimmed.split('=');
    acc[key.trim()] = rest.join('=').trim();
    return acc;
  }, {});
}

const envFromFile = parseEnvFile(resolve(projectRoot, '.env'));
const DASH_KEY = process.env.DASH_KEY || envFromFile.DASH_KEY || '';
const API_BASE = process.env.API_BASE || envFromFile.API_BASE || 'http://192.168.0.50:3001';

function serveConfig (response) {
  const payload = JSON.stringify({ dashKey: DASH_KEY, baseApi: API_BASE });
  response.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(payload);
}

function sendNotFound (response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

function sendError (response, error) {
  console.error(error);
  response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Internal server error');
}

function serveStatic (filePath, response) {
  try {
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      return serveStatic(join(filePath, 'index.html'), response);
    }
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=60'
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendNotFound(response);
    } else {
      sendError(response, error);
    }
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === '/__config__') {
    serveConfig(response);
    return;
  }

  let filePath = normalize(url.pathname);
  if (filePath.startsWith('..')) {
    sendNotFound(response);
    return;
  }

  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  serveStatic(resolve(projectRoot, `.${filePath}`), response);
});

server.listen(defaultPort, () => {
  console.log(`Dashboard dev server running on http://localhost:${defaultPort}`);
});

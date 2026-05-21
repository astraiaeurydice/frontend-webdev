/**
 * One-time helper: replace hardcoded localhost API URLs with config imports.
 * Run from Frontend/: node scripts/migrate-api-urls.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.js')) files.push(p);
  }
  return files;
}

function relImport(fromFile, configPath = 'config/api.js') {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, path.join(root, configPath)).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.js$/, '');
}

const importLine = (rel) =>
  `import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '${rel}';\n`;

for (const file of walk(root)) {
  if (file.includes(`${path.sep}config${path.sep}api.js`)) continue;

  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  if (!content.includes('127.0.0.1:8000') && !content.includes('localhost:8000')) continue;

  content = content
    .replace(/const API_URL = 'http:\/\/127\.0\.0\.1:8000\/api';?\n?/g, '')
    .replace(/const API_URL = 'http:\/\/127\.0\.0\.1:8000';?\n?/g, '')
    .replace(/const BASE_URL = 'http:\/\/127\.0\.0\.1:8000';?\n?/g, '')
    .replace(/const API_BASE = 'http:\/\/localhost:8000\/api\/suppliers';?\n?/g, '')
    .replace(/const API_URL = 'http:\/\/localhost:8000'; \/\/ Change to your backend URL\n?/g, '');

  content = content.replace(/http:\/\/127\.0\.0\.1:8000/g, '${API_BASE_URL}');
  content = content.replace(/http:\/\/localhost:8000/g, '${API_BASE_URL}');

  // Fix accidental template in non-template strings: fetch('${API_BASE_URL}/api/...') -> fetch(`${API_BASE_URL}/api/...`)
  content = content.replace(
    /fetch\('(\$\{API_BASE_URL\}[^']*)'/g,
    'fetch(`$1`'
  );
  content = content.replace(
    /fetch\("(\$\{API_BASE_URL\}[^"]*)"/g,
    'fetch(`$1`'
  );

  // src={`${API_BASE_URL}...`} is already fine; fix src={'${API_BASE_URL}...'}
  content = content.replace(/src=\{'(\$\{API_BASE_URL\}[^']*)'\}/g, 'src={`$1`}');

  // window.location.href = "${API_BASE_URL}/connect/google" -> googleOAuthUrl()
  if (content.includes('${API_BASE_URL}/connect/google')) {
    content = content.replace(
      /window\.location\.href = ["'`]\$\{API_BASE_URL\}\/connect\/google["'`];?/g,
      'window.location.href = googleOAuthUrl();'
    );
  }

  const rel = relImport(file);
  const imp = importLine(rel);
  if (!content.includes("from '" + rel + "'") && !content.includes('from "' + rel + '"')) {
    const m = content.match(/^import .+;\n/m);
    if (m) {
      content = content.replace(m[0], m[0] + imp);
    } else {
      content = imp + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', path.relative(root, file));
  }
}

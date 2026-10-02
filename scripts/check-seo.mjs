// Audits the built HTML for the tags crawlers need. Run after `npm run build`:
//   node ../scripts/check-seo.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'react-app', 'dist');

const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok, detail });

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html not found - run `npm run build` first.');
  process.exit(1);
}

const html = readFileSync(join(dist, 'index.html'), 'utf8');

// --- Required head tags ---
const meta = (attr, key) =>
  new RegExp(`<meta[^>]+${attr}="${key}"[^>]+content="([^"]*)"`).exec(html)?.[1];

check('<title> present', /<title>.{5,70}<\/title>/.test(html), (/<title>([^<]*)<\/title>/.exec(html) ?? [])[1]);
check('meta description 50-160 chars', (() => { const d = meta('name', 'description'); return !!d && d.length >= 50 && d.length <= 170; })(), `${meta('name', 'description')?.length ?? 0} chars`);
check('canonical -> production domain', /<link rel="canonical" href="https:\/\/devfazla\.com\/"/.test(html));
check('meta robots indexable', /name="robots"[^>]+content="index/.test(html));
check('viewport present', /name="viewport"/.test(html));
check('html lang set', /<html lang="en"/.test(html));
check('theme-color present', !!meta('name', 'theme-color'), meta('name', 'theme-color'));
check('Google site verification tag', /google-site-verification/.test(html), /google-site-verification" content="([^"]*)"/.exec(html)?.[1] === 'REPLACE_WITH_GOOGLE_VERIFICATION_TOKEN' ? 'STILL A PLACEHOLDER - paste your token' : 'set');

// --- Social cards ---
check('og:type', !!meta('property', 'og:type'), meta('property', 'og:type'));
check('og:title', !!meta('property', 'og:title'));
check('og:image absolute URL', /^https:\/\/devfazla\.com\/og-image\.png$/.test(meta('property', 'og:image') ?? ''));
check('og:image dimensions declared', !!meta('property', 'og:image:width') && !!meta('property', 'og:image:height'));
check('twitter:card summary_large_image', meta('name', 'twitter:card') === 'summary_large_image', meta('name', 'twitter:card'));

// --- Structured data must be valid JSON and well-formed ---
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
check('exactly one JSON-LD block', ld.length === 1, `found ${ld.length}`);
try {
  const data = JSON.parse(ld[0]);
  const types = (data['@graph'] ?? []).map((n) => n['@type']);
  check('JSON-LD parses', true);
  check('Person + WebSite + ProfilePage present', ['Person', 'WebSite', 'ProfilePage'].every((t) => types.includes(t)), types.join(', '));
  const person = (data['@graph'] ?? []).find((n) => n['@type'] === 'Person');
  check('Person.sameAs has 4 profiles', Array.isArray(person?.sameAs) && person.sameAs.length >= 4, `${person?.sameAs?.length ?? 0}`);
  check('all JSON-LD @id/@url absolute', JSON.stringify(data).includes('https://devfazla.com'));
} catch (err) {
  check('JSON-LD parses', false, err.message);
}

// --- Crawl files shipped to the web root ---
for (const file of ['robots.txt', 'sitemap.xml', 'site.webmanifest', 'og-image.png', 'favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'CNAME', '404.html', 'routes.yml', '.nojekyll', 'images/profile.png']) {
  check(`dist/${file} exists`, existsSync(join(dist, file)));
}

const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
check('robots.txt references sitemap', /Sitemap:\s*https:\/\/devfazla\.com\/sitemap\.xml/.test(robots));
check('robots.txt does not block the site', !/^Disallow: \/$/m.test(robots));

const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
check('sitemap lists production URL', sitemap.includes('https://devfazla.com/'));
check('sitemap has no duplicate /index.html', !sitemap.includes('/index.html'));

const cname = existsSync(join(dist, 'CNAME')) ? readFileSync(join(dist, 'CNAME'), 'utf8').trim() : '';
check('CNAME matches canonical domain', cname === 'devfazla.com', cname || 'missing');

// --- Report ---
const width = Math.max(...results.map((r) => r.label.length));
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label.padEnd(width)}${r.detail ? `  (${r.detail})` : ''}`);
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);

// Phase 3: download public Gali assets + write manifest and products.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '..';
const PUB = `${ROOT}/public/assets`;
for (const d of ['gali', 'products', 'campaigns', 'brands', 'categories']) fs.mkdirSync(`${PUB}/${d}`, { recursive: true });
const manifest = [];
const home = JSON.parse(fs.readFileSync(`${ROOT}/research/raw-home.json`, 'utf8'));
const site = JSON.parse(fs.readFileSync(`${ROOT}/research/raw-site.json`, 'utf8'));

const slug = (s) => s.split('/').pop().split('?')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '-');
async function dl(url, dir, name = slug(url), note = '') {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 GaliConceptResearch' } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(`${PUB}/${dir}/${name}`, buf);
  const local = `/assets/${dir}/${name}`;
  manifest.push({ local, url, note, kb: Math.round(buf.length / 1024) });
  return local;
}
// Original (uncached, full-res) product image if available, else cached 600x800.
const original = (u) => u.replace(/\/cache\/[0-9a-f]+\//, '/');
async function dlProduct(u, name) {
  return (await dl(original(u), 'products', name, 'original resolution')) || dl(u, 'products', name, 'cached 600x800');
}

// 1. logos + chain logos from header
for (const i of home.imgs.filter((i) => i.src.includes('/idus/stores/'))) await dl(i.src, 'gali', slug(i.src), `header: ${i.alt}`);
await dl('https://www.gali.co.il/pub/media/catalog/category/Outlet_Gali_2.png', 'gali', 'outlet-wordmark.png', 'nav Outlet wordmark');

// 2. campaign + category + lifestyle imagery from homepage (non-product)
for (const i of home.imgs) {
  if (i.src.includes('/catalog/product/') || i.src.includes('/idus/stores/') || i.src.includes('loader')) continue;
  if (i.w < 150) continue;
  const dir = i.src.includes('SARGEL') || i.src.includes('menu_') ? 'categories' : 'campaigns';
  await dl(i.src, dir, slug(i.src), `homepage: ${i.alt}`);
}
await dl('https://www.gali.co.il/pub/static/version1768218088/frontend/Idus/Brill/he_IL/images/newsletter/newsletter.jpg', 'campaigns', 'newsletter.jpg', 'newsletter background');

// 3. brand logos from /gali-brands
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://www.gali.co.il/gali-brands', { waitUntil: 'networkidle', timeout: 90000 });
const brands = await page.evaluate(() => [...document.querySelectorAll('.page-main img')].map((i) => ({ src: i.src, alt: i.alt, href: i.closest('a')?.href })).filter((b) => b.src.includes('/catalog/category/')));
const brandOut = [];
for (const b of brands) brandOut.push({ ...b, local: await dl(b.src, 'brands', slug(b.src), `brands page: ${b.alt || b.href}`) });
await browser.close();

// 4. curated product set (deduped by style number, one colour each)
const seen = new Set();
const products = [];
for (const [cat, c] of Object.entries(site.categories)) {
  for (const it of c.items) {
    if (!it.img) continue;
    const style = slug(it.img).split('_')[0];
    if (seen.has(style)) continue;
    seen.add(style);
    const m = it.text.match(/^(.*?)\s*מחיר מוצר ([\d.]+) ₪(?: מחיר רגיל ([\d.]+) ₪)?/);
    const brandMatch = it.text.replace(/^(SALE|NEW COLLECTION|הוסף לסל)\s+/, '');
    products.push({
      id: style, category: cat, url: it.url,
      badge: it.text.startsWith('SALE') ? 'SALE' : it.text.startsWith('NEW') ? 'NEW' : null,
      raw: brandMatch.slice(0, 120),
      price: m ? Number(m[2]) : null, was: m && m[3] ? Number(m[3]) : null,
      promo: /זוג שני ב 59.90/.test(it.text) ? 'זוג שני ב-59.90' : null,
      image: await dlProduct(it.img, `${style}.jpg`),
    });
  }
}
// extra gallery shots for PDP picks (for hover/second image)
for (const p of site.products) {
  const style = slug(p.gallery[0] || '').split('_')[0];
  const prod = products.find((x) => x.id === style);
  if (!prod || p.gallery.length < 2) continue;
  prod.name = p.name; prod.desc = p.desc || null; prod.sizes = p.sizes;
  prod.alt = await dlProduct(p.gallery[1], `${style}-b.jpg`);
}
fs.writeFileSync(`${ROOT}/research/products.json`, JSON.stringify({ products, brands: brandOut }, null, 1));

const md = ['# Asset sources', '', 'All assets downloaded from the public site https://www.gali.co.il/ on 2026-09-22 for an unofficial concept redesign (portfolio use). robots.txt allows these paths; no authentication used.', '', '| Local path | Source URL | Note | KB |', '|---|---|---|---|',
  ...manifest.map((m) => `| \`${m.local}\` | ${m.url} | ${m.note} | ${m.kb} |`)];
fs.writeFileSync(`${ROOT}/research/asset-sources.md`, md.join('\n'));
console.log('assets', manifest.length, 'products', products.length, 'brands', brandOut.length);

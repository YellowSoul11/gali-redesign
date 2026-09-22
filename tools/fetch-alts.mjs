// Fetch a second gallery angle (hover image) for selected products from their public PDPs.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';

const ids = process.argv.slice(2);
const { products } = JSON.parse(fs.readFileSync('../research/products.json', 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage();
const lines = [];
for (const id of ids) {
  const p = products.find((x) => x.id === id);
  if (!p?.url) { console.log('no url', id); continue; }
  await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  const gallery = await page.evaluate(() => [...new Set([...document.querySelectorAll('.product.media img, [class*=gallery] img')].map((i) => i.src).filter((s) => s && /\/catalog\/product\//.test(s)))]);
  const alt = gallery.find((g) => /_\d+a-/.test(g)) || gallery[1];
  if (!alt) { console.log('no alt', id); continue; }
  const orig = alt.replace(/\/cache\/[0-9a-f]+\//, '/');
  let res = await fetch(orig);
  let used = orig;
  if (!res.ok) { res = await fetch(alt); used = alt; }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(`../public/assets/products/${id}-b.jpg`, buf);
  await sharp(buf).resize(900).webp({ quality: 80 }).toFile(`../public/assets/opt/p-${id}-b.webp`);
  lines.push(`| \`/assets/products/${id}-b.jpg\` | ${used} | PDP gallery angle (${p.url}) | ${Math.round(buf.length / 1024)} |`);
  console.log('ok', id);
}
await browser.close();
fs.appendFileSync('../research/asset-sources.md', '\n' + lines.join('\n'));

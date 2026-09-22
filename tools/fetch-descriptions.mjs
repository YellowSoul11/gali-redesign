// Fill in PDP description / SKU / composition by fetching the product HTML directly
// (the browser crawl captured textContent, which mixed in inline scripts).
import fs from 'node:fs';

const RAW = '../research/catalog-raw.json';
const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const urls = Object.keys(raw.pdp);
const clean = (s) => s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ').trim();

let done = 0, filled = 0;
async function one(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 GaliConceptResearch' } });
    if (!res.ok) return;
    const html = await res.text();
    const block = html.match(/<div class="page-content"[^>]*>([\s\S]*?)<\/div>/);
    if (!block) return;
    const text = clean(block[1]);
    const sku = (text.match(/מקט:\s*(\S+)/) || [])[1];
    const material = (text.match(/הרכב:\s*(.+)$/m) || [])[1]?.trim();
    const desc = text.split(/\s*מקט:/)[0].replace(/\n+/g, ' ').trim();
    raw.pdp[url] = { ...raw.pdp[url], desc, skuLabel: sku, material };
    if (desc) filled++;
  } catch { /* skip */ }
  finally { if (++done % 100 === 0) console.log(done, '/', urls.length); }
}
const queue = [...urls];
await Promise.all(Array.from({ length: 10 }, async () => { while (queue.length) await one(queue.shift()); }));
fs.writeFileSync(RAW, JSON.stringify(raw, null, 1));
console.log('descriptions filled', filled, '/', urls.length);

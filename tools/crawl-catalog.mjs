// Phase 2 catalog crawl: departments + subcategories (listing data incl. sizes/colours), then PDPs (gallery, details).
// Public pages only; robots.txt allows. Output: research/catalog-raw.json
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '../research/catalog-raw.json';
const DEPTS = ['women', 'men', 'girls', 'boys', 'sale', 'new'];
const PER_DEPT = Number(process.env.PER_DEPT || 24);
const ONLY_PARSE = process.env.ONLY_PARSE;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
const go = async (u) => { await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.waitForTimeout(3000); };

const parseItems = () => page.evaluate(() => {
  const txt = (e) => (e?.textContent || '').replace(/\s+/g, ' ').trim();
  return [...document.querySelectorAll('.product-item')].map((p) => {
    const form = p.querySelector('form[data-product-sku]');
    const price = (t) => { const e = p.querySelector(`[data-price-type="${t}"]`); return e ? Number(e.getAttribute('data-price-amount')) || Number(txt(e).replace(/[^\d.]/g, '')) : null; };
    const opt = (sel) => [...p.querySelectorAll(sel)].map((o) => ({
      label: o.getAttribute('data-option-label') || o.getAttribute('aria-label') || txt(o),
      disabled: o.classList.contains('disabled') || o.getAttribute('disabled') !== null || o.classList.contains('out-of-stock'),
      swatch: o.getAttribute('data-option-tooltip-value') || o.style.backgroundImage || o.style.background || '',
    }));
    return {
      sku: form?.getAttribute('data-product-sku'),
      url: p.querySelector('a.product_link, a.product-item-link, a')?.href,
      img: p.querySelector('img.product-image-photo')?.src,
      name: txt(p.querySelector('.product-item-link, .product-item-name, .product-name')) || p.querySelector('img.product-image-photo')?.alt,
      brand: txt(p.querySelector('[class*=brand], .product-brand')),
      stampa: txt(p.querySelector('.product-category-stampa-swatch')),
      final: price('finalPrice'), old: price('oldPrice'),
      text: txt(p).slice(0, 400),
      sizes: opt('.swatch-attribute.size .swatch-option'),
      colors: opt('.swatch-attribute.color .swatch-option'),
    };
  });
});

async function loadListing(url, max) {
  await go(url);
  let items = await parseItems();
  for (let i = 0; i < 8 && items.length < max; i++) {
    await page.mouse.wheel(0, 6000); await page.waitForTimeout(2200);
    const n = await parseItems();
    if (n.length === items.length) break;
    items = n;
  }
  return items.slice(0, max);
}

if (ONLY_PARSE) {
  const items = await loadListing('https://www.gali.co.il/women', 12);
  console.log(JSON.stringify(items[0], null, 1));
  await browser.close();
  process.exit(0);
}

const out = { crawled: new Date().toISOString(), depts: {}, subcats: {}, pdp: {} };
for (const d of DEPTS) {
  const items = await loadListing(`https://www.gali.co.il/${d}`, PER_DEPT);
  const meta = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent.trim(),
    intro: (document.querySelector('.category-description')?.textContent || '').replace(/\s+/g, ' ').trim(),
    subcats: [...document.querySelectorAll('.filter-options-item')].slice(0, 1).flatMap((b) => [...b.querySelectorAll('.filter-options-content a')].map((a) => ({ label: a.textContent.replace(/קטגוריה/g, '').replace(/\s+/g, ' ').trim(), href: a.href }))),
  }));
  const seen = new Set(); meta.subcats = meta.subcats.filter((s) => s.label && !seen.has(s.href) && seen.add(s.href));
  out.depts[d] = { ...meta, items };
  console.log(d, items.length, 'subcats', meta.subcats.length);
  for (const s of meta.subcats) {
    const si = await loadListing(s.href, 12);
    out.subcats[`${d}/${s.label}`] = { dept: d, label: s.label, href: s.href, items: si };
    console.log('  ', s.label, si.length);
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

// PDPs for every product we keep
const urls = [...new Set([...Object.values(out.depts), ...Object.values(out.subcats)].flatMap((d) => d.items.map((i) => i.url)).filter(Boolean))];
console.log('pdp urls', urls.length);
for (const u of urls) {
  try {
    await go(u);
    out.pdp[u] = await page.evaluate(() => {
      const txt = (e) => (e?.textContent || '').replace(/\s+/g, ' ').trim();
      const gallery = [...new Set([...document.querySelectorAll('.product.media img, [class*=gallery] img')].map((i) => i.src).filter((s) => /\/catalog\/product\//.test(s)))];
      const acc = [...document.querySelectorAll('.product-info-main [data-role=collapsible], .product.info.detailed .data.item.title, .product-info-main .title')].map((t) => txt(t)).filter(Boolean);
      return {
        name: txt(document.querySelector('h1')),
        crumbs: [...document.querySelectorAll('.breadcrumbs li')].map(txt),
        sku: txt(document.querySelector('.product.attribute.sku .value, [itemprop=sku]')),
        desc: txt(document.querySelector('.product.attribute.description .value, .product.attribute.description')),
        info: txt(document.querySelector('.product-info-main')).slice(0, 2500),
        acc, gallery,
      };
    });
  } catch (e) { console.log('pdp fail', u, e.message); }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('pdps', Object.keys(out.pdp).length);
await browser.close();

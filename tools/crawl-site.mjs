// Phase 2: category listings, product pages and brand/about pages.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '../research';
const CATS = ['women', 'men', 'girls', 'boys', 'new', 'sale', 'gali-brands', 'accessories'];
const INFO = ['about-gali', 'stores', 'club'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
const page = await ctx.newPage();
const go = async (u) => { await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.waitForTimeout(3500); };
const txt = `(e) => (e?.innerText || '').replace(/\\s+/g, ' ').trim()`;

const result = { categories: {}, products: [], info: {} };

for (const c of CATS) {
  await go(`https://www.gali.co.il/${c}`);
  await page.screenshot({ path: `${OUT}/screens/cat-${c}.png` });
  result.categories[c] = await page.evaluate((txtSrc) => {
    const txt = eval(txtSrc);
    const items = [...document.querySelectorAll('.product-item')].slice(0, 40).map((p) => {
      const img = p.querySelector('img.product-image-photo, img');
      const a = p.querySelector('a.product-item-link, a');
      const prices = [...p.querySelectorAll('.price')].map(txt);
      return {
        name: txt(p.querySelector('.product-item-link, .product-item-name')),
        text: txt(p).slice(0, 200),
        url: a?.href, img: img?.currentSrc || img?.src, alt: img?.alt,
        prices, label: txt(p.querySelector('.product-label, .label, [class*=label]')),
      };
    });
    const filters = [...document.querySelectorAll('.filter-options-title, .filter-options .title, [class*=filter] dt')].map(txt).filter(Boolean);
    const subcats = [...document.querySelectorAll('.category-list a, .subcategories a, .sidebar a')].map(txt).filter(Boolean).slice(0, 40);
    const banners = [...document.querySelectorAll('.category-image img, .category-view img, .page-main img')].slice(0, 5).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth }));
    return { title: document.title, h1: txt(document.querySelector('h1')), count: txt(document.querySelector('.toolbar-amount')), filters, subcats, banners, items };
  }, txt);
  console.log(c, result.categories[c].items.length, result.categories[c].count);
}

// product pages: pick a spread across categories
const picks = [];
for (const c of ['women', 'men', 'girls', 'boys', 'new', 'sale']) {
  for (const it of result.categories[c].items.slice(0, 2)) if (it.url && !picks.includes(it.url)) picks.push(it.url);
}
for (const u of picks) {
  await go(u);
  const d = await page.evaluate((txtSrc) => {
    const txt = eval(txtSrc);
    const gallery = [...new Set([...document.querySelectorAll('.fotorama__img, .gallery-placeholder img, .product.media img, [class*=gallery] img')].map((i) => i.src).filter((s) => s && !s.startsWith('data:')))];
    return {
      url: location.href, name: txt(document.querySelector('h1, .page-title')),
      prices: [...document.querySelectorAll('.product-info-main .price')].map(txt),
      sku: txt(document.querySelector('.sku .value, [itemprop=sku]')),
      brand: txt(document.querySelector('[class*=brand]')).slice(0, 60),
      sizes: [...document.querySelectorAll('.swatch-option.text, [class*=size] .swatch-option')].map(txt),
      colors: [...document.querySelectorAll('.swatch-option.color, .swatch-option.image')].map((e) => e.getAttribute('aria-label') || e.getAttribute('data-option-label')),
      desc: txt(document.querySelector('.product.attribute.description, .product-info-main .overview, #description')).slice(0, 600),
      infoText: txt(document.querySelector('.product-info-main')).slice(0, 900),
      gallery,
    };
  }, txt);
  result.products.push(d);
  console.log('P', d.name, d.prices.join(' '), d.gallery.length);
}
await go(picks[0]);
await page.screenshot({ path: `${OUT}/screens/pdp-desktop.png` });

for (const i of INFO) {
  await go(`https://www.gali.co.il/${i}`);
  await page.screenshot({ path: `${OUT}/screens/info-${i}.png` });
  result.info[i] = await page.evaluate((txtSrc) => eval(txtSrc)(document.querySelector('main, .page-main, .columns')).slice(0, 5000), txt);
}
fs.writeFileSync(`${OUT}/raw-site.json`, JSON.stringify(result, null, 1));

// mobile listing + nav
await page.setViewportSize({ width: 390, height: 844 });
await go('https://www.gali.co.il/women');
await page.screenshot({ path: `${OUT}/screens/cat-women-mobile.png` });
await browser.close();

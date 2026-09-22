// Phase 2: capture Gali homepage structure, nav, styles and screenshots.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '../research';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'he-IL' });
const page = await ctx.newPage();
await page.goto('https://www.gali.co.il/', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);
// dismiss popups if any (close buttons only, no consent acceptance)
for (const sel of ['.modal-popup .action-close', '[aria-label="סגור"]', '.close-popup']) {
  const el = page.locator(sel).first();
  if (await el.isVisible().catch(() => false)) await el.click().catch(() => {});
}
await page.screenshot({ path: `${OUT}/screens/home-desktop.png`, fullPage: true });

const data = await page.evaluate(() => {
  const txt = (e) => (e?.innerText || '').replace(/\s+/g, ' ').trim();
  const links = [...document.querySelectorAll('header a, nav a, .navigation a')].map((a) => ({ t: txt(a), h: a.href })).filter((l) => l.t);
  const footer = [...document.querySelectorAll('footer a')].map((a) => ({ t: txt(a), h: a.href })).filter((l) => l.t);
  const imgs = [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })).filter((i) => i.src && !i.src.startsWith('data:'));
  const bgs = [...document.querySelectorAll('*')].map((e) => getComputedStyle(e).backgroundImage).filter((b) => b && b.startsWith('url'));
  const sections = [...document.querySelectorAll('main > *, .page-main > *, .widget, .block, section')].slice(0, 80).map((s) => ({ cls: s.className?.toString().slice(0, 80), text: txt(s).slice(0, 300) })).filter((s) => s.text);
  const cs = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); return { font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, color: s.color, bg: s.backgroundColor }; };
  const logo = document.querySelector('.logo img, a.logo img, header img');
  return {
    title: document.title,
    links, footer, imgs, bgs: [...new Set(bgs)],
    sections,
    styles: { body: cs('body'), h1: cs('h1'), h2: cs('h2'), header: cs('header'), a: cs('nav a'), button: cs('button.action.primary, .action.primary'), price: cs('.price') },
    logo: logo ? { src: logo.currentSrc || logo.src, alt: logo.alt } : null,
    fonts: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`),
    bodyText: txt(document.body).slice(0, 12000),
  };
});
fs.writeFileSync(`${OUT}/raw-home.json`, JSON.stringify(data, null, 1));

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/screens/home-mobile.png`, fullPage: true });
await browser.close();
console.log('links', data.links.length, 'imgs', data.imgs.length, 'logo', JSON.stringify(data.logo));
console.log(JSON.stringify(data.styles));
console.log([...new Set(data.fonts)].join(' | '));

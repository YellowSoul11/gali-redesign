// Hit-test the hero CTAs: sample a 5x3 grid + corners/edges of each button with elementFromPoint,
// at several scroll positions (before / during / after the shoe flight), then perform real clicks.
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:5173/';
const widths = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [375, 812]];
const CTAS = [
  { name: 'לקולקציה החדשה', sel: '.hero-copy a.btn-primary', dest: /#new$/ },
  { name: 'למבצעי סוף העונה', sel: '.hero-copy a.btn-outline', dest: /localhost:5173\/sale$/ },
];

const browser = await chromium.launch();
let failures = 0;
for (const [w, h] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'he-IL' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  // keep external navigation local
  await page.route(/gali\.co\.il/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>ok</p>' }));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // entrance animations

  for (const cta of CTAS) {
    const btn = page.locator(cta.sel);
    await btn.scrollIntoViewIfNeeded();
    const baseY = await page.evaluate(() => scrollY);
    // phases: button at rest (before), page scrolled so the flight is in progress (during), and further (after, still visible)
    for (const [phase, dy] of [['before', 0], ['during', 120], ['after', 240]]) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, baseY + dy - (phase === 'before' ? 0 : 0)));
      await page.waitForTimeout(700);
      const res = await page.evaluate((sel) => {
        const b = document.querySelector(sel);
        const r = b.getBoundingClientRect();
        if (r.bottom < 70 || r.top > innerHeight) return { skipped: true };
        const pts = [];
        for (const fx of [0.02, 0.25, 0.5, 0.75, 0.98]) for (const fy of [0.06, 0.5, 0.94]) pts.push([r.left + r.width * fx, r.top + r.height * fy]);
        const bad = pts.map(([x, y]) => [x, y, document.elementFromPoint(x, y)])
          .filter(([, , el]) => !el || !b.contains(el))
          .map(([x, y, el]) => `${Math.round(x)},${Math.round(y)} → ${el ? el.tagName + '.' + String(el.className).slice(0, 70) : 'null'}`);
        return { n: pts.length, bad };
      }, cta.sel);
      if (res.skipped) continue;
      if (res.bad.length) failures++;
      console.log(`${w} ${cta.name} [${phase}] ${res.n - res.bad.length}/${res.n} hit`, res.bad.slice(0, 3).join(' | '));
    }
    // real click at centre and at a corner, then check destination
    await page.evaluate((y) => window.scrollTo(0, y), baseY);
    await page.waitForTimeout(500);
    const box = await btn.boundingBox();
    for (const [fx, fy, label] of [[0.5, 0.5, 'centre'], [0.04, 0.12, 'corner']]) {
      await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
      await page.waitForTimeout(400);
      const ok = cta.dest.test(page.url());
      if (!ok) failures++;
      console.log(`${w} ${cta.name} click ${label}: ${ok ? 'OK' : 'FAIL'} → ${page.url()}`);
      if (!page.url().includes('#') && page.url() !== URL) { await page.goBack(); await page.waitForTimeout(1200); }
      else if (page.url().includes('#')) { await page.evaluate(() => history.replaceState(null, '', '/')); }
      await page.evaluate((y) => window.scrollTo(0, y), baseY);
      await page.waitForTimeout(400);
    }
  }
  // keyboard: focus reachable + Enter activates
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  let focused = '';
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement?.textContent?.trim() || '');
    if (focused.startsWith('לקולקציה החדשה')) break;
  }
  const focusVisible = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const kbOk = focused.startsWith('לקולקציה החדשה') && /#new$/.test(page.url());
  if (!kbOk) failures++;
  console.log(`${w} keyboard: reached=${focused.startsWith('לקולקציה החדשה')} focus-ring=${focusVisible} enter→${page.url()} ${kbOk ? 'OK' : 'FAIL'}`);
  console.log(`${w} console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  await ctx.close();
}
await browser.close();
console.log(failures ? `FAILURES: ${failures}` : 'ALL PASS');
process.exitCode = failures ? 1 : 0;

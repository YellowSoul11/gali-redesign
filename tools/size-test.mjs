// Purchase-flow test for real shoe sizes on the PDP (1440 desktop, 390 mobile touch).
import { chromium } from 'playwright';
const BASE = process.env.URL || 'http://localhost:5173';
const PID = '655644'; // Lee Cooper: real sizes 36–41, sold out 36/37/41
let fails = 0;
const ok = (w, name, cond, info = '') => { if (!cond) fails++; console.log(`${w} ${cond ? '✓' : '✗'} ${name}${info ? ' — ' + info : ''}`); };
const browser = await chromium.launch();

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'he-IL', hasTouch: mobile, isMobile: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const tap = (loc) => (mobile ? loc.tap() : loc.click());

  await page.goto(`${BASE}/product/${PID}`, { waitUntil: 'networkidle' });
  ok(w, 'PDP opens', (await page.locator('h1').textContent()).includes('סניקרס סטייל אורבני'));
  ok(w, 'no "מידה אחידה"', !(await page.content()).includes('מידה אחידה'));

  const radios = page.locator('[role=radiogroup] input[name=size]');
  const labels = await radios.evaluateAll((els) => els.map((e) => ({ l: e.getAttribute('aria-label'), d: e.disabled })));
  ok(w, 'real size range 36–41 rendered', labels.map((x) => x.l.match(/\d+/)[0]).join(',') === '36,37,38,39,40,41', labels.map((x) => x.l).join(' | '));
  ok(w, 'sold-out sizes 36/37/41 disabled', labels.filter((x) => x.d).map((x) => x.l.match(/\d+/)[0]).join(',') === '36,37,41');

  // unavailable cannot be selected (click / tap the visual chip)
  const chip = (n) => page.locator('[role=radiogroup] label', { has: page.locator(`input[aria-label^="מידה ${n}"]`) });
  await tap(chip(36)).catch(() => {});
  ok(w, 'tapping sold-out 36 selects nothing', (await page.locator('input[name=size]:checked').count()) === 0);
  const st = await chip(36).locator('span').evaluate((e) => ({ td: getComputedStyle(e).textDecorationLine, c: getComputedStyle(e).color }));
  ok(w, 'sold-out chip visibly struck through', st.td.includes('line-through'), JSON.stringify(st));

  // add without size
  await tap(page.locator('.pdp .atc').first());
  await page.waitForTimeout(300);
  ok(w, 'ATC without size → Hebrew error', (await page.locator('#size-err').textContent()) === 'יש לבחור מידה לפני ההוספה לסל');
  ok(w, 'nothing added to bag', (await page.locator('.sheet.is-open').count()) === 0);

  // select, then change size
  await tap(chip(38));
  ok(w, 'select 38', await page.locator('input[aria-label^="מידה 38"]').isChecked());
  ok(w, 'error clears on selection', (await page.locator('#size-err').count()) === 0);
  await tap(chip(40));
  const sel = await page.evaluate(() => [...document.querySelectorAll('input[name=size]:checked')].map((e) => e.getAttribute('aria-label')));
  ok(w, 'change to 40 (single selection)', sel.length === 1 && sel[0].startsWith('מידה 40'), sel.join());
  await page.waitForTimeout(250); // colour transition
  const selStyle = await chip(40).locator('span').evaluate((e) => getComputedStyle(e).backgroundColor);
  ok(w, 'selected chip filled (ink)', selStyle === 'rgb(21, 21, 20)', selStyle);
  ok(w, 'legend shows selected size', (await page.locator('#size-label').textContent()).includes('40'));

  // add with valid size → cart stores + shows 40
  await tap(page.locator('.pdp .atc').first());
  await page.waitForSelector('.sheet.is-open .bag-line', { timeout: 3000 }).catch(() => {});
  const line = await page.locator('.sheet.is-open .bag-line').first().textContent().catch(() => '');
  ok(w, 'cart line shows size 40', /מידה\s*40/.test(line), line.replace(/\s+/g, ' ').slice(0, 80));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gali-concept-v1')).bag);
  ok(w, 'bag state stores size 40', stored.length === 1 && stored[0].size === '40' && stored[0].id === '655644', JSON.stringify(stored));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // size guide
  await tap(page.locator('button', { hasText: 'טבלת מידות' }));
  await page.waitForTimeout(450);
  const guide = page.locator('.sheet.is-open');
  ok(w, 'size guide opens (women chart)', (await guide.locator('h3').first().textContent()) === 'הנעלה נשים' && (await guide.locator('tbody tr').count()) === 15);
  ok(w, 'guide highlights selected 40', (await guide.locator('tr[aria-current]').textContent()).startsWith('40'));
  const gb = await guide.locator('.sheet-panel').boundingBox();
  ok(w, 'guide fits viewport', gb.width <= w && gb.x >= 0, `${Math.round(gb.x)}+${Math.round(gb.width)}`);
  if (mobile) await tap(guide.locator('button[aria-label="סגירה"]')); else await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok(w, 'size guide closes', (await page.locator('.sheet.is-open').count()) === 0);

  // keyboard: arrows move within available sizes only, Enter on ATC adds
  if (!mobile) {
    await page.evaluate(() => localStorage.clear()); // clear before load: the store reads storage on boot
    await page.goto(`${BASE}/product/${PID}`, { waitUntil: 'networkidle' });
    await page.locator('input[aria-label^="מידה 38"]').focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft'); // RTL: next = 39
    const k1 = await page.evaluate(() => document.querySelector('input[name=size]:checked')?.getAttribute('aria-label'));
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); // 40 → skips sold-out 41 → wraps to 38
    const k2 = await page.evaluate(() => document.querySelector('input[name=size]:checked')?.getAttribute('aria-label'));
    ok(w, 'keyboard arrows skip sold-out sizes', k1?.startsWith('מידה 39') && !k2?.includes('41'), `${k1} → ${k2}`);
    const focusRing = await page.evaluate(() => getComputedStyle(document.activeElement.nextElementSibling).outlineStyle);
    ok(w, 'focus ring on size chip', focusRing !== 'none', focusRing);
    await page.locator('.pdp .atc').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    ok(w, 'keyboard Enter adds to bag', (await page.locator('.sheet.is-open .bag-line').count()) === 1);
    await page.keyboard.press('Escape');
  }

  // mobile: sticky ATC respects size rule
  if (mobile) {
    await page.goto(`${BASE}/product/${PID}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => window.scrollBy(0, 1300)); await page.waitForTimeout(500);
    await tap(page.locator('.mobile-atc .atc'));
    await page.waitForTimeout(700);
    ok(w, 'sticky ATC without size → error, scrolls to sizes', await page.locator('#size-err').isVisible());
    const tgt = await page.locator('[role=radiogroup] label').first().boundingBox();
    ok(w, 'size chips ≥ 44px touch targets', tgt.height >= 44 && tgt.width >= 44, `${Math.round(tgt.width)}×${Math.round(tgt.height)}`);
  }

  // copy removal: department section spacing
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const d = await page.evaluate(() => {
    const h = document.getElementById('dept-title'); const list = h.nextElementSibling;
    return { gone: !document.body.innerText.includes('מחולקות לפי מחלקה'), gap: Math.round(list.getBoundingClientRect().top - h.getBoundingClientRect().bottom), overflow: document.documentElement.scrollWidth - innerWidth };
  });
  ok(w, 'removed copy is gone', d.gone);
  ok(w, 'heading → list spacing intact', d.gap >= 36 && d.gap <= 64, `${d.gap}px`);
  ok(w, 'no horizontal overflow', d.overflow <= 0);
  ok(w, 'no console errors', !errors.length, errors.slice(0, 2).join(' | '));
  await page.screenshot({ path: `../research/qa/size-${w}-dept.png`, clip: undefined }).catch(() => {});
  await ctx.close();
}
await browser.close();
console.log(fails ? `FAILURES: ${fails}` : 'ALL PASS');
process.exitCode = fails ? 1 : 0;

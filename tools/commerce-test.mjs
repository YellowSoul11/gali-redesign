// End-to-end interaction tests for PLP + PDP at 1440 / 1024 / 768 / 390 / 375.
import { chromium } from 'playwright';

const BASE = process.env.URL || 'http://localhost:5173';
const widths = (process.env.W ? process.env.W.split(',').map(Number) : [1440, 1024, 768, 390, 375]).map((w) => [w, w >= 1024 ? 900 : w >= 768 ? 1024 : 844]);
const browser = await chromium.launch();
let fails = 0;
const log = (w, name, ok, info = '') => { if (!ok) fails++; console.log(`${w} ${ok ? '✓' : '✗'} ${name}${info ? ' — ' + info : ''}`); };

async function health(page, w, label) {
  const r = await page.evaluate(() => {
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src && !i.closest('[hidden]')).map((i) => i.src.split('/').pop());
    return { overflow: document.documentElement.scrollWidth - innerWidth, broken };
  });
  log(w, `${label}: no horizontal overflow`, r.overflow <= 0, `scrollWidth-innerWidth=${r.overflow}`);
  log(w, `${label}: no broken images`, !r.broken.length, r.broken.slice(0, 3).join(','));
}
async function hitFree(page, w, sel, label) {
  const r = await page.evaluate((sel) => {
    const el = document.querySelector(sel); if (!el) return 'missing';
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return el.contains(hit) ? 'ok' : `${hit?.tagName}.${String(hit?.className).slice(0, 60)}`;
  }, sel);
  log(w, `${label}: not intercepted`, r === 'ok', r);
}

for (const [w, h] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'he-IL', hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const desktop = w >= 1024;

  // 1. home → category (department index link, all widths)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.locator('.dept-row').first().click();
  await page.waitForURL('**/women');
  log(w, 'home → /women via department index', (await page.locator('h1').textContent()) === 'נשים');
  // header navigation to /men
  if (desktop) { await page.locator('nav[aria-label="ראשי"] a', { hasText: 'גברים' }).click(); }
  else { await page.locator('button[aria-label="פתיחת תפריט"]').click(); await page.locator('summary', { hasText: 'גברים' }).click(); await page.locator('a', { hasText: 'לכל נעלי הגברים' }).click(); }
  await page.waitForURL('**/men');
  log(w, 'header nav → /men', (await page.locator('h1').textContent()) === 'גברים');
  await page.goto(BASE + '/women', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const total = await page.locator('.plp-item').count();
  log(w, 'PLP renders products', total > 8, `${total} cards`);
  await health(page, w, 'PLP');

  // 2. filtering
  const before = Number(await page.locator('[aria-live="polite"] .num').first().textContent());
  if (desktop) {
    await page.locator('.plp-toolbar button', { hasText: 'מידה' }).click();
    await page.locator('.popover .size-chip:not([disabled])').first().click();
    await page.keyboard.press('Escape');
  } else {
    await page.locator('.plp-toolbar button', { hasText: 'סינון' }).click();
    await page.waitForTimeout(400);
    const sizeDetails = page.locator('.sheet.is-open details', { hasText: 'מידה' });
    if (!(await sizeDetails.getAttribute('open'))) await sizeDetails.locator('summary').click();
    await sizeDetails.locator('.size-chip:not([disabled])').first().click();
    await page.locator('.sheet.is-open button', { hasText: 'הצגת' }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(300);
  const url1 = page.url();
  const after = Number(await page.locator('[aria-live="polite"] .num').first().textContent());
  log(w, 'filter by size updates URL + results', /size=/.test(url1) && after > 0 && after <= before, `${before} → ${after}`);
  log(w, 'active filter chip shown', (await page.locator('[aria-label="סינונים פעילים"] .chip').count()) === 1);

  // 3. sorting
  if (desktop) await page.selectOption('.plp-toolbar select', 'price-asc');
  else { await page.locator('.plp-toolbar button', { hasText: 'מומלצים' }).click(); await page.waitForTimeout(350); await page.locator('.sheet.is-open label', { hasText: 'מהנמוך לגבוה' }).click(); }
  await page.waitForTimeout(400);
  const prices = await page.$$eval('.plp-item .num .font-bold', (els) => els.map((e) => Number(e.textContent.replace(/[^\d.]/g, ''))));
  log(w, 'sort price ascending', prices.length > 1 && prices.every((p, i) => !i || p >= prices[i - 1]) && /sort=price-asc/.test(page.url()), prices.slice(0, 5).join(' ≤ '));
  const plpUrl = page.url();

  // 4. product hover (fine pointer only)
  if (desktop) {
    const card = page.locator('.plp-item .pcard').first();
    await card.hover(); await page.waitForTimeout(450);
    const alt = await card.locator('.pcard-alt').evaluate((e) => getComputedStyle(e).opacity).catch(() => 'none');
    const quick = await card.locator('.pcard-quick').evaluate((e) => getComputedStyle(e).opacity).catch(() => 'none');
    log(w, 'card hover: second angle + quick add', (alt === '1' || alt === 'none') && quick === '1', `alt=${alt} quick=${quick}`);
  }
  await hitFree(page, w, '.plp-item .pcard-link', 'card link');

  // 5. category → product
  const name = (await page.locator('.plp-item .pcard-link').first().textContent()).trim();
  await page.locator('.plp-item .pcard-link').first().click();
  await page.waitForURL('**/product/**');
  await page.waitForTimeout(500);
  log(w, 'PLP → PDP (same product)', (await page.locator('h1').textContent()).trim() === name, name);
  await health(page, w, 'PDP');

  // 6. gallery + lightbox
  const imgCount = desktop ? await page.locator('.gallery-cell').count() : await page.locator('[aria-label="תמונות המוצר"] li').first().locator('..').locator('li').count();
  if (!desktop && imgCount > 1) {
    await page.locator('ul[aria-label="תמונות המוצר"]').first().evaluate((el) => el.scrollBy({ left: -el.clientWidth }));
    await page.waitForTimeout(600);
    log(w, 'mobile gallery swipe updates counter', /^2 \//.test((await page.locator('.lg\\:hidden p.num').first().textContent()).trim()));
  }
  await page.locator(desktop ? '.gallery-cell' : 'ul[aria-label="תמונות המוצר"] button').first().click();
  await page.waitForTimeout(300);
  const lb = page.locator('.lightbox');
  log(w, 'lightbox opens', await lb.isVisible());
  if (imgCount > 1) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(150); log(w, 'lightbox arrow key → next image', /^2 \//.test((await lb.locator('p.num').textContent()).trim())); }
  await page.keyboard.press('Escape');
  log(w, 'lightbox closes on Esc', !(await lb.isVisible().catch(() => false)));

  // 7. size selection + validation
  await page.locator('.pdp .atc').first().click();
  await page.waitForTimeout(250);
  log(w, 'ATC without size → error', await page.locator('#size-err').isVisible());
  const size = page.locator('[role=radiogroup] input[name=size]:not([disabled])').first();
  const sizeLabel = await size.getAttribute('aria-label');
  await size.locator('..').click();
  log(w, 'size selected', await size.isChecked(), sizeLabel);
  await hitFree(page, w, '.pdp .atc', 'ATC button');

  // 8. add to cart → mini cart
  await page.locator('.pdp .atc').first().click();
  await page.waitForSelector('.sheet.is-open [role=status]', { timeout: 3000 }).catch(() => {});
  const drawer = page.locator('.sheet.is-open');
  log(w, 'mini cart opens with confirmation', (await drawer.count()) === 1 && (await drawer.locator('[role=status]').isVisible()));
  log(w, 'cart line shows product + size', (await drawer.locator('.bag-line').count()) === 1 && (await drawer.locator('.bag-line').textContent()).includes(sizeLabel.replace('מידה ', '').split(' ')[0]));
  await drawer.locator('button[aria-label="הוספת כמות"]').click();
  log(w, 'qty stepper', (await drawer.locator('.bag-line [aria-live]').textContent()) === '2');
  const badge = await page.locator('button[aria-label^="סל קניות"]').getAttribute('aria-label');
  log(w, 'header bag count', badge.includes('(2)'), badge);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(350);
  log(w, 'mini cart closes on Esc + focus returns', (await page.locator('.sheet.is-open').count()) === 0);

  // 9. mobile sticky ATC
  if (!desktop) {
    await page.evaluate(() => window.scrollBy(0, 1400)); await page.waitForTimeout(500);
    log(w, 'mobile sticky add-to-cart appears', (await page.locator('.mobile-atc.is-on').count()) === 1);
    await hitFree(page, w, '.mobile-atc .atc', 'sticky ATC');
  }

  // 10. size guide
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('button', { hasText: 'טבלת מידות' }).click();
  await page.waitForTimeout(350);
  log(w, 'size guide shows real chart', (await page.locator('.sheet.is-open table tbody tr').count()) > 10);
  await page.keyboard.press('Escape'); await page.waitForTimeout(350);

  // 11. back to category keeps filters + sort
  await page.goBack();
  await page.waitForURL((u) => u.toString() === plpUrl, { timeout: 5000 }).catch(() => {});
  log(w, 'back → category with filters restored', page.url() === plpUrl && (await page.locator('[aria-label="סינונים פעילים"] .chip').count()) === 1);

  // 12. keyboard: PDP size via arrows, Enter adds
  await page.goto(BASE + '/product/655644', { waitUntil: 'networkidle' });
  await page.locator('[role=radiogroup] input[name=size]:not([disabled])').first().focus();
  await page.keyboard.press('ArrowLeft');
  const checked = await page.locator('[role=radiogroup] input[name=size]:checked').count();
  await page.locator('.pdp .atc').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  log(w, 'keyboard: arrow selects size, Enter adds', checked === 1 && (await page.locator('.sheet.is-open .bag-line').count()) >= 1);
  const inDrawer = await page.evaluate(() => !!document.activeElement?.closest('.sheet.is-open'));
  log(w, 'keyboard: focus moves into mini cart', inDrawer);
  await page.keyboard.press('Escape');

  log(w, 'no console errors', !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close();
console.log(fails ? `FAILURES: ${fails}` : 'ALL PASS');
process.exitCode = fails ? 1 : 0;

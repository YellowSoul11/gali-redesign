// Build src/data/catalog.generated.json from research/catalog-raw.json and download/optimise imagery.
// One product per style (e.g. 655644); colour variants keyed by colour code (e.g. 1006).
import fs from 'node:fs';
import sharp from 'sharp';

const raw = JSON.parse(fs.readFileSync('../research/catalog-raw.json', 'utf8'));
const OPT = '../public/assets/opt';
const SKIP_IMAGES = process.env.SKIP_IMAGES;

const SUB_SLUGS = {
  'כפכפים': 'slides', 'סנדלי שורש': 'footbed-sandals', 'נעלי בית': 'slippers', 'נעלי מוקסין': 'moccasins',
  'נעליים שטוחות': 'flats', 'סנדלים שטוחים': 'flat-sandals', 'מגפונים': 'ankle-boots', 'סניקרס': 'sneakers',
  'נעלי ספורט': 'sport', 'נעלי עקב': 'heels', 'סנדלי עקב': 'heeled-sandals', 'מגפיים': 'boots',
  'נעליים נמוכות': 'shoes', 'סנדלים': 'sandals', 'נעליים גבוהות': 'high-tops', 'נעליים טקטיות': 'tactical',
  'נעלי בובה וסניקרס': 'dolly-shoes', 'נעלי צעד ראשון': 'first-steps', 'מגפי גשם': 'rain-boots', 'נעלי כדורגל': 'football',
};
const DEPTS = ['women', 'men', 'girls', 'boys'];

const styleOf = (img) => (img?.split('/').pop() || '').split('_')[0];
const codeOf = (img) => ((img?.split('/').pop() || '').split('_')[1] || '').split(/[a-z]?-/)[0];
const original = (u) => u.replace(/\/cache\/[0-9a-f]+\//, '/');

function parseFlags(text) {
  return {
    isNew: /NEW COLLECTION/.test(text),
    saleType: /FINAL SALE/.test(text) ? 'FINAL SALE' : /OUTLET/.test(text) ? 'OUTLET' : undefined,
    promo: /זוג שני ב ?59\.90/.test(text) ? 'זוג שני ב-59.90 ₪' : undefined,
  };
}
function deptFromName(name, url) {
  if (/לנשים|נשים/.test(name)) return 'women';
  if (/לגברים|גברים|גבר/.test(name)) return 'men';
  if (/לילדות|לבנות|ילדות/.test(name)) return 'girls';
  if (/לבנים|לילדים/.test(name)) return 'boys';
  const seg = new URL(url).pathname.split('/')[1];
  return DEPTS.includes(seg) ? seg : undefined;
}

const products = new Map();
function ingest(item, ctx) {
  if (!item.img || !item.url) return;
  const id = styleOf(item.img), code = codeOf(item.img);
  if (!id || !code) return;
  let p = products.get(id);
  if (!p) {
    const flags = parseFlags(item.text);
    p = {
      id, slug: id, brand: item.brand, name: item.name, price: item.final, was: item.old || undefined,
      ...flags, depts: new Set(), subcats: new Set(), inSale: false, inNew: false, variants: new Map(), colorCount: item.colors.length || 1,
    };
    products.set(id, p);
  }
  if (DEPTS.includes(ctx.dept)) p.depts.add(ctx.dept);
  if (ctx.dept === 'sale') p.inSale = true;
  if (ctx.dept === 'new') p.inNew = true;
  if (ctx.sub && DEPTS.includes(ctx.dept)) p.subcats.add(`${ctx.dept}-${SUB_SLUGS[ctx.sub] || ctx.sub}`);
  if (!p.variants.has(code)) {
    p.variants.set(code, {
      code, sku: item.sku, realUrl: item.url, srcImg: item.img,
      color: item.colors[0]?.label || '',
      // Gali marks sold-out sizes with the suffix " - אזל מהמלאי" (and/or a disabled swatch)
      sizes: item.sizes.map((s) => ({ label: s.label.replace(/\s*-\s*אזל מהמלאי\s*$/, '').trim(), available: !s.disabled && !/אזל מהמלאי/.test(s.label) })),
    });
  }
}
for (const [d, v] of Object.entries(raw.depts)) v.items.forEach((i) => ingest(i, { dept: d }));
for (const v of Object.values(raw.subcats)) v.items.forEach((i) => ingest(i, { dept: v.dept, sub: v.label }));

// subcategory index (only subcats that have products)
const subIndex = {};
for (const v of Object.values(raw.subcats)) {
  if (!DEPTS.includes(v.dept)) continue;
  const slug = `${v.dept}-${SUB_SLUGS[v.label] || v.label}`;
  subIndex[slug] = { slug, dept: v.dept, label: v.label, realUrl: v.href };
}

async function save(url, file, width) {
  if (fs.existsSync(`${OPT}/${file}`)) return true;
  for (const u of [original(url), url]) {
    try {
      const res = await fetch(u); if (!res.ok) continue;
      await sharp(Buffer.from(await res.arrayBuffer())).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OPT}/${file}`);
      return u;
    } catch { /* try next */ }
  }
  return false;
}

const manifest = [];
const out = [];
async function build(p) {
  const variants = [];
  for (const v of p.variants.values()) {
    const pdp = raw.pdp[v.realUrl] || {};
    const gallerySrc = (pdp.gallery?.length ? pdp.gallery : [v.srcImg]).slice(0, 5);
    const base = `${p.id}-${v.code}`;
    const gallery = [];
    if (!SKIP_IMAGES) {
      const main = await save(v.srcImg, `p-${base}.webp`, 900);
      if (!main) continue;
      manifest.push([`/assets/opt/p-${base}.webp`, typeof main === 'string' ? main : v.srcImg]);
      for (const [i, g] of gallerySrc.entries()) {
        const ok = await save(g, `g-${base}-${i}.webp`, 1200);
        if (ok) { gallery.push(`/assets/opt/g-${base}-${i}.webp`); manifest.push([`/assets/opt/g-${base}-${i}.webp`, typeof ok === 'string' ? ok : g]); }
      }
      if (gallerySrc[1]) { const ok = await save(gallerySrc[1], `p-${base}-b.webp`, 900); if (ok) manifest.push([`/assets/opt/p-${base}-b.webp`, gallerySrc[1]]); }
    }
    const info = pdp.info || '';
    variants.push({
      code: v.code, sku: v.sku, color: v.color, realUrl: v.realUrl, sizes: v.sizes,
      img: `/assets/opt/p-${base}.webp`, alt: gallerySrc[1] ? `/assets/opt/p-${base}-b.webp` : undefined, gallery,
      desc: pdp.desc || undefined,
      material: pdp.material || (info.match(/הרכב:\s*(.+?)(?:\s\||\s*$)/) || [])[1]?.trim(),
      skuLabel: pdp.skuLabel || (info.match(/מקט:\s*(\S+)/) || [])[1],
    });
  }
  if (!variants.length) return;
  const dept = [...p.depts][0] || deptFromName(p.name, variants[0].realUrl) || 'women';
  out.push({
    id: p.id, slug: p.slug, brand: p.brand, name: p.name, price: p.price, was: p.was,
    isNew: p.isNew || p.inNew || undefined, saleType: p.saleType, promo: p.promo,
    onSale: !!p.was || p.inSale || undefined,
    dept, subcats: [...p.subcats], colorCount: p.colorCount, variants,
  });
}
// download with a small worker pool; keep crawl order for stable 'position' sort
const queue = [...products.values()];
const order = new Map(queue.map((p, i) => [p.id, i]));
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await build(queue.shift()); }));
out.sort((a, b) => order.get(a.id) - order.get(b.id));
fs.writeFileSync('../src/data/catalog.generated.json', JSON.stringify({ crawled: raw.crawled, products: out, subcats: Object.values(subIndex), intros: Object.fromEntries(Object.entries(raw.depts).map(([k, v]) => [k, v.intro])) }));
const srcMd = fs.readFileSync('../research/asset-sources.md', 'utf8').split('\n\n## Catalog imagery')[0];
fs.writeFileSync('../research/asset-sources.md', srcMd + `\n\n## Catalog imagery (PLP/PDP), crawled ${raw.crawled}\n\n| Local | Source |\n|---|---|\n` + manifest.map(([l, s]) => `| \`${l}\` | ${s} |`).join('\n'));
console.log('products', out.length, 'variants', out.reduce((n, p) => n + p.variants.length, 0), 'subcats', Object.keys(subIndex).length);

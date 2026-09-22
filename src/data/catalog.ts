// Catalog: real Gali products crawled from gali.co.il (see tools/crawl-catalog.mjs, tools/build-catalog.mjs).
// One product per style id (e.g. "655644"); colour variants carry their own images and real size availability.
import generated from './catalog.generated.json';
import { legacyProducts } from './legacy';
import { asset } from '../lib/base';

export type Dept = 'women' | 'men' | 'girls' | 'boys';
export interface Size { label: string; available: boolean }
export interface Variant {
  code: string; sku?: string; color: string; realUrl?: string; sizes: Size[];
  img: string; alt?: string; gallery: string[];
  desc?: string; material?: string; skuLabel?: string;
}
export interface Product {
  id: string; slug: string; brand: string; name: string;
  price: number; was?: number;
  /** real Gali labels */
  isNew?: boolean; saleType?: 'OUTLET' | 'FINAL SALE'; promo?: string; onSale?: boolean;
  dept: Dept; subcats: string[]; colorCount: number; variants: Variant[];
  /** has an alpha cut-out in /assets/opt/cut-{id}.webp */
  cutout?: boolean;
}
export interface Subcat { slug: string; dept: Dept; label: string; realUrl?: string }

const gen = generated as unknown as { products: Product[]; subcats: Subcat[]; intros: Record<string, string>; crawled: string };

const CUTOUTS = new Set(['655644', '655642', '655653', '154077', '449208', '656648', '657630', '647683', '544188', '445175', '542210', '540045', '547100', '542138', '640060', '457060']);

export const catalog: Product[] = gen.products.map((p) => ({
  ...p, cutout: CUTOUTS.has(p.id),
  variants: p.variants.map((v) => ({ ...v, img: asset(v.img), alt: v.alt && asset(v.alt), gallery: v.gallery.map(asset) })),
}));
export const products: Record<string, Product> = Object.fromEntries(catalog.map((p) => [p.id, p]));

// Homepage styles that the crawl did not reach keep their hand-curated record.
for (const l of Object.values(legacyProducts)) {
  if (products[l.id]) continue;
  const p: Product = {
    id: l.id, slug: l.id, brand: l.brand, name: l.name, price: l.price, was: l.was,
    isNew: l.isNew, saleType: l.saleType, promo: l.promo, onSale: !!l.was, dept: l.dept, subcats: [], colorCount: l.colors.length,
    variants: [{ code: 'x', color: l.colors[0] || '', sizes: [], img: asset(`/assets/opt/p-${l.id}.webp`), alt: asset(`/assets/opt/p-${l.id}-b.webp`), gallery: [asset(`/assets/opt/p-${l.id}.webp`), asset(`/assets/opt/p-${l.id}-b.webp`)] }],
    cutout: l.cutout,
  };
  catalog.push(p);
  products[l.id] = p;
}

export const subcats: Subcat[] = gen.subcats.filter((s) => catalog.some((p) => p.subcats.includes(s.slug)));
export const intros = gen.intros;

export const productHref = (id: string, code?: string) => `/product/${products[id]?.slug ?? id}${code ? `?color=${code}` : ''}`;
export const img = (id: string) => products[id]?.variants[0].img ?? asset(`/assets/opt/p-${id}.webp`);
export const imgAlt = (id: string) => products[id]?.variants[0].alt;
export const cut = (id: string) => asset(`/assets/opt/cut-${id}.webp`);
export const campaign = (id: string, w: 960 | 1920 = 1920) => asset(`/assets/opt/c-${id}-${w}.webp`);
export const fmt = (n: number) => n.toFixed(2);
export const discount = (p: Product) => (p.was ? Math.round((1 - p.price / p.was) * 100) : 0);
export const brandSlug = (b: string) => b.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const HERO_PRODUCT = '655644';
export const NEW_COLLECTION = ['655642', '657630', '154077', '647683', '640060', '457060'];

export const deptLabel: Record<Dept, string> = { women: 'נשים', men: 'גברים', girls: 'בנות', boys: 'בנים' };

export const departments: { id: Dept; label: string; href: string; image: string; sub: string[] }[] = [
  { id: 'women', label: 'נשים', href: '/women', image: '18113820437008717', sub: [] },
  { id: 'men', label: 'גברים', href: '/men', image: '18391392736204145', sub: [] },
  { id: 'girls', label: 'בנות', href: '/girls', image: '17922499524415907', sub: [] },
  { id: 'boys', label: 'בנים', href: '/boys', image: '17933463726368776', sub: [] },
];
for (const d of departments) d.sub = subcats.filter((s) => s.dept === d.id).map((s) => s.label);
export const subcatsOf = (dept: Dept) => subcats.filter((s) => s.dept === dept);

// Colour name → swatch tone (design mapping for real Gali colour names)
const TONES: [RegExp, string][] = [
  [/שחור/, '#151514'], [/לבן|off white/i, '#f7f5f0'], [/בז|ניוד|קרם|אבן|טבעי|שמנת/, '#d9c3a0'], [/חום|מוקה|שוקולד|אגוז|כאמל|טאופה/, '#6b4a2f'],
  [/נייבי|כחול כהה/, '#1f2a44'], [/תכלת|כחול בהיר|אקווה/, '#9cc9e6'], [/כחול|ג׳ינס|ג’ינס/, '#2c5aa0'], [/ורוד|פודרה|פוקסיה|פקסיה|קוראל/, '#eeb0c0'],
  [/אדום|בורדו/, '#b3261e'], [/ירוק|זית|חאקי/, '#4f6b3a'], [/אפור|פיוטר/, '#8b8b86'], [/כסף/, '#c4c6c8'], [/זהב|ברונזה/, '#c09a4a'],
  [/סגול|לילך/, '#9a7cc4'], [/צהוב|חרדל/, '#e8c14a'], [/כתום/, '#e07b39'], [/נמר|מנומר/, '#b98a4e'],
];
export const colorTone = (name: string) => TONES.find(([r]) => r.test(name))?.[1] ?? '#b9b3a8';
export const colorFamily = (name: string) => {
  const hit = TONES.find(([r]) => r.test(name));
  if (!hit) return name;
  const map: Record<string, string> = { '#151514': 'שחור', '#f7f5f0': 'לבן', '#d9c3a0': 'בז׳', '#6b4a2f': 'חום', '#1f2a44': 'נייבי', '#9cc9e6': 'תכלת', '#2c5aa0': 'כחול', '#eeb0c0': 'ורוד', '#b3261e': 'אדום', '#4f6b3a': 'ירוק', '#8b8b86': 'אפור', '#c4c6c8': 'כסף', '#c09a4a': 'זהב', '#9a7cc4': 'סגול', '#e8c14a': 'צהוב', '#e07b39': 'כתום', '#b98a4e': 'מנומר' };
  return map[hit[1]];
};

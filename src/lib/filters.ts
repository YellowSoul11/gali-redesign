import { colorFamily, deptLabel, subcats, type Product } from '../data/catalog';

// Facets mirror gali.co.il: קטגוריה, מותג, צבע, מבצע, מידה, מחיר (+ מחלקה on cross-department pages).
export type FacetKey = 'dept' | 'sub' | 'size' | 'brand' | 'color' | 'promo';
export const FACET_LABEL: Record<FacetKey, string> = { dept: 'מחלקה', sub: 'קטגוריה', size: 'מידה', brand: 'מותג', color: 'צבע', promo: 'מבצע' };
export const PROMOS = ['NEW COLLECTION', 'זוג שני ב-59.90 ₪', 'OUTLET', 'FINAL SALE'] as const;

export const SORTS = [
  { id: 'position', label: 'מומלצים' },
  { id: 'price-asc', label: 'מחיר: מהנמוך לגבוה' },
  { id: 'price-desc', label: 'מחיר: מהגבוה לנמוך' },
  { id: 'name', label: 'שם מוצר' },
] as const;
export type SortId = (typeof SORTS)[number]['id'];

export interface FilterState { dept: string[]; sub: string[]; size: string[]; brand: string[]; color: string[]; promo: string[]; min?: number; max?: number; sort: SortId }

export function readFilters(sp: URLSearchParams): FilterState {
  const list = (k: string) => (sp.get(k) ? sp.get(k)!.split(',').filter(Boolean) : []);
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  const sort = (sp.get('sort') as SortId) || 'position';
  return { dept: list('dept'), sub: list('sub'), size: list('size'), brand: list('brand'), color: list('color'), promo: list('promo'), min: num('min'), max: num('max'), sort: SORTS.some((s) => s.id === sort) ? sort : 'position' };
}

export function writeFilters(f: FilterState): URLSearchParams {
  const sp = new URLSearchParams();
  (['dept', 'sub', 'size', 'brand', 'color', 'promo'] as FacetKey[]).forEach((k) => f[k].length && sp.set(k, f[k].join(',')));
  if (f.min != null) sp.set('min', String(f.min));
  if (f.max != null) sp.set('max', String(f.max));
  if (f.sort !== 'position') sp.set('sort', f.sort);
  return sp;
}

/** values a product exposes per facet */
export function valuesOf(p: Product, k: FacetKey): string[] {
  switch (k) {
    case 'dept': return [p.dept];
    case 'sub': return p.subcats;
    case 'brand': return [p.brand];
    case 'color': return [...new Set(p.variants.map((v) => colorFamily(v.color)).filter(Boolean))];
    case 'size': return [...new Set(p.variants.flatMap((v) => v.sizes.filter((s) => s.available).map((s) => s.label)))];
    case 'promo': return [p.isNew && 'NEW COLLECTION', p.promo, p.saleType].filter(Boolean) as string[];
  }
}

function passes(p: Product, f: FilterState, except?: FacetKey | 'price') {
  for (const k of ['dept', 'sub', 'size', 'brand', 'color', 'promo'] as FacetKey[]) {
    if (k === except || !f[k].length) continue;
    const vals = valuesOf(p, k);
    if (!f[k].some((v) => vals.includes(v))) return false;
  }
  if (except !== 'price') {
    if (f.min != null && p.price < f.min) return false;
    if (f.max != null && p.price > f.max) return false;
  }
  return true;
}

export function applyFilters(list: Product[], f: FilterState): Product[] {
  const out = list.filter((p) => passes(p, f));
  if (f.sort === 'price-asc') out.sort((a, b) => a.price - b.price);
  if (f.sort === 'price-desc') out.sort((a, b) => b.price - a.price);
  if (f.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  return out;
}

export interface FacetOption { value: string; label: string; count: number }

const sizeOrder = (s: string) => (isNaN(Number(s)) ? 1000 + s.charCodeAt(0) : Number(s));

/** Options for a facet with counts computed against the other active filters (standard faceted search). */
export function facetOptions(list: Product[], f: FilterState, k: FacetKey): FacetOption[] {
  const counts = new Map<string, number>();
  for (const p of list) {
    if (!passes(p, f, k)) continue;
    for (const v of valuesOf(p, k)) counts.set(v, (counts.get(v) || 0) + 1);
  }
  // keep selected values visible even at zero
  f[k].forEach((v) => counts.has(v) || counts.set(v, 0));
  const label = (v: string) => (k === 'dept' ? deptLabel[v as keyof typeof deptLabel] : k === 'sub' ? subcats.find((s) => s.slug === v)?.label ?? v : v);
  let opts = [...counts].map(([value, count]) => ({ value, label: label(value), count }));
  if (k === 'size') opts.sort((a, b) => sizeOrder(a.value) - sizeOrder(b.value));
  else if (k === 'promo') opts.sort((a, b) => PROMOS.indexOf(a.value as never) - PROMOS.indexOf(b.value as never));
  else opts.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'he'));
  if (k === 'sub') opts = opts.filter((o) => o.label !== o.value || o.count);
  return opts;
}

export function priceBounds(list: Product[]) {
  if (!list.length) return { lo: 0, hi: 0 };
  const ps = list.map((p) => p.price);
  return { lo: Math.floor(Math.min(...ps)), hi: Math.ceil(Math.max(...ps)) };
}

export const activeCount = (f: FilterState) =>
  (['dept', 'sub', 'size', 'brand', 'color', 'promo'] as FacetKey[]).reduce((n, k) => n + f[k].length, 0) + (f.min != null || f.max != null ? 1 : 0);

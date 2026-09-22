import { asset } from '../lib/base';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { catalog, products, campaign, deptLabel, type Dept } from '../data/catalog';
import { getCategory } from '../data/categories';
import { brandLogos, brandHref } from '../data/brands';
import {
  readFilters, writeFilters, applyFilters, facetOptions, priceBounds, activeCount, FACET_LABEL, SORTS,
  type FacetKey, type FilterState, type SortId,
} from '../lib/filters';
import { ProductCard } from '../components/commerce/ProductCard';
import { CheckList, SizeGrid, ColorList, PriceRange } from '../components/commerce/Facets';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Sheet } from '../components/ui/Sheet';
import { Icon } from '../components/ui/Icon';
import NotFound from './NotFound';

const PAGE = 24;

export default function CategoryPage({ kind }: { kind: string }) {
  const { slug } = useParams();
  const cat = getCategory(kind, slug);
  const [sp, setSp] = useSearchParams();
  const f = readFilters(sp);
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState<null | 'filter' | 'sort'>(null);

  const scoped = useMemo(() => (cat ? catalog.filter(cat.scope) : []), [cat?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = useMemo(() => applyFilters(scoped, f), [scoped, sp.toString()]); // eslint-disable-line react-hooks/exhaustive-deps
  const bounds = useMemo(() => priceBounds(scoped), [scoped]);

  useEffect(() => { setShown(PAGE); }, [cat?.key, sp.toString()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (cat) document.title = `${cat.title} | גלי (Concept)`; }, [cat]);

  if (!cat) return <NotFound />;

  const update = (next: Partial<FilterState>) => setSp(writeFilters({ ...f, ...next }), { preventScrollReset: true, replace: false });
  const toggle = (k: FacetKey, v: string) => update({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] } as Partial<FilterState>);
  const clearAll = () => setSp(f.sort !== 'position' ? new URLSearchParams({ sort: f.sort }) : new URLSearchParams(), { preventScrollReset: true });

  const facetKeys: FacetKey[] = [
    ...(cat.multiDept ? (['dept'] as FacetKey[]) : []),
    ...(facetOptions(scoped, f, 'sub').length > 1 ? (['sub'] as FacetKey[]) : []),
    'size', 'brand', 'color', 'promo',
  ];
  const facetBody = (k: FacetKey | 'price'): ReactNode => {
    if (k === 'price') return <PriceRange lo={bounds.lo} hi={bounds.hi} min={f.min} max={f.max} onChange={(min, max) => update({ min, max })} />;
    const opts = facetOptions(scoped, f, k);
    if (k === 'size') return <SizeGrid options={opts} selected={f.size} onToggle={(v) => toggle('size', v)} />;
    if (k === 'color') return <ColorList options={opts} selected={f.color} onToggle={(v) => toggle('color', v)} />;
    return <CheckList name={FACET_LABEL[k]} options={opts} selected={f[k]} onToggle={(v) => toggle(k, v)} />;
  };
  // Gali order: category → size → brand → colour → price → promotion
  const allFacets: (FacetKey | 'price')[] = [...facetKeys.slice(0, facetKeys.indexOf('color') + 1), 'price' as const, 'promo' as const];
  const facetLabel = (k: FacetKey | 'price') => (k === 'price' ? 'מחיר' : FACET_LABEL[k]);
  const facetActive = (k: FacetKey | 'price') => (k === 'price' ? (f.min != null || f.max != null ? 1 : 0) : f[k].length);
  const n = activeCount(f);

  // Editorial tile: one campaign image per department page, placed in the grid
  const tile = cat.image && !n && f.sort === 'position' && results.length > 8;

  return (
    <div className="plp">
      {/* Category header — compact so products start above the fold */}
      <header className="shell pt-6 lg:pt-8">
        <Breadcrumbs items={cat.crumbs} />
        <div className="mt-4 lg:mt-6 grid lg:grid-cols-12 gap-x-5 gap-y-4 items-end">
          <div className="lg:col-span-7">
            <h1 className="display text-[clamp(2.5rem,1.6rem+3.6vw,5rem)]">{cat.title}</h1>
            {cat.intro && <p className="soft mt-3 text-[16px] lg:text-[17px] text-ink-2 max-w-[56ch] max-lg:line-clamp-2">{cat.intro}</p>}
          </div>
          {cat.image && (
            <div className="hidden lg:block lg:col-span-5 h-[168px] overflow-hidden bg-paper-2">
              <img src={campaign(cat.image, 960)} alt="" className="size-full object-cover object-[50%_28%]" />
            </div>
          )}
        </div>

        {/* Subcategory rail (Gali's icon carousel, refined): packshot + label */}
        {cat.rail.length > 0 && (
          <nav aria-label="תת-קטגוריות" className="mt-6 lg:mt-8 -mx-[var(--gutter)] px-[var(--gutter)] overflow-x-auto no-scrollbar">
            <ul className="flex gap-2 lg:gap-3 w-max">
              {cat.rail.map((r) => (
                <li key={r.to}>
                  <a href={r.to} aria-current={r.active ? 'page' : undefined}
                    className={`rail-item group flex flex-col items-center gap-2 w-[92px] lg:w-[112px] pb-2 ${r.active ? 'is-active' : ''}`}>
                    <span className={`grid place-items-center w-full aspect-[4/3] bg-[#efe9df] transition-shadow duration-200 ${r.active ? 'shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : ''}`}>
                      {r.productId && <img src={products[r.productId].variants[0].img} alt="" loading="lazy" className="size-[88%] object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />}
                    </span>
                    <span className={`text-[13px] leading-tight text-center ${r.active ? 'font-semibold' : 'text-ink-2 group-hover:text-ink'}`}>{r.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {cat.brandIndex && (
          <nav aria-label="מותגים" className="mt-6 lg:mt-8 -mx-[var(--gutter)] px-[var(--gutter)] overflow-x-auto no-scrollbar">
            <ul className="flex w-max border-y border-s border-line">
              {brandLogos.map((b) => (
                <li key={b.file} className="border-e border-line">
                  <a href={brandHref(b.key)} className="brand-cell grid place-items-center w-[124px] h-[72px] p-4" aria-label={b.name}>
                    <img src={asset(`/assets/brands/${b.file}`)} alt={b.name} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Toolbar — sticky under the header */}
      <div className="plp-toolbar sticky top-[var(--header-h)] z-30 mt-6 bg-paper/95 border-y border-line">
        <div className="shell flex items-center gap-2 h-14">
          {/* mobile */}
          <button className="lg:hidden flex-1 h-11 flex items-center justify-center gap-2 font-semibold" onClick={() => setSheet('filter')}>
            <Icon name="sliders" className="size-5" />סינון{n > 0 && <span className="num grid place-items-center min-w-5 h-5 px-1 rounded-full bg-ink text-paper text-[11px]">{n}</span>}
          </button>
          <span aria-hidden className="lg:hidden w-px h-6 bg-line" />
          <button className="lg:hidden flex-1 h-11 flex items-center justify-center gap-2 font-semibold" onClick={() => setSheet('sort')}>
            <Icon name="sort" className="size-5" />{SORTS.find((s) => s.id === f.sort)!.label}
          </button>

          {/* desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {allFacets.map((k) => (
              <Popover key={k} label={facetLabel(k)} active={facetActive(k)} wide={k === 'size' || k === 'color'}>{facetBody(k)}</Popover>
            ))}
          </div>
          <p className="hidden lg:block ms-auto text-[14px] text-ink-2" aria-live="polite"><span className="num font-semibold text-ink">{results.length}</span> מוצרים</p>
          <label className="hidden lg:flex items-center gap-2 ms-6 text-[14px]">
            <span className="text-ink-2">מיון:</span>
            <span className="relative">
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value as SortId })}
                className="appearance-none h-10 ps-3 pe-9 bg-transparent font-semibold border border-transparent hover:border-line focus:border-ink rounded-[2px] cursor-pointer">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <Icon name="down" className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </span>
          </label>
        </div>
      </div>

      <div className="shell pb-24 lg:pb-32">
        {/* Active filters */}
        {n > 0 && (
          <ul className="flex flex-wrap items-center gap-2 pt-5" aria-label="סינונים פעילים">
            {(['dept', 'sub', 'size', 'brand', 'color', 'promo'] as FacetKey[]).flatMap((k) => f[k].map((v) => (
              <li key={k + v}>
                <button className="chip inline-flex items-center gap-2 h-9 ps-3 pe-2 bg-paper-2 text-[13px] hover:bg-line" onClick={() => toggle(k, v)} aria-label={`הסרת סינון ${FACET_LABEL[k]}: ${v}`}>
                  <span className="text-ink-3">{FACET_LABEL[k]}:</span>
                  <span className="font-medium">{k === 'dept' ? deptLabel[v as Dept] : k === 'sub' ? facetOptions(scoped, f, 'sub').find((o) => o.value === v)?.label ?? v : v}</span>
                  <Icon name="close" className="size-3.5" />
                </button>
              </li>
            )))}
            {(f.min != null || f.max != null) && (
              <li><button className="chip inline-flex items-center gap-2 h-9 ps-3 pe-2 bg-paper-2 text-[13px] hover:bg-line" onClick={() => update({ min: undefined, max: undefined })}>
                <span className="text-ink-3">מחיר:</span><span className="num font-medium" dir="ltr">₪{f.min ?? bounds.lo}–₪{f.max ?? bounds.hi}</span><Icon name="close" className="size-3.5" />
              </button></li>
            )}
            <li><button className="h-9 px-2 text-[13px] font-semibold underline underline-offset-4" onClick={clearAll}>ניקוי הכל</button></li>
          </ul>
        )}

        <p className="lg:hidden pt-4 text-[13px] text-ink-2" aria-live="polite"><span className="num font-semibold text-ink">{results.length}</span> מוצרים</p>

        {results.length ? (
          <>
            <ul key={sp.toString()} className="plp-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-11 pt-5 lg:pt-8">
              {results.slice(0, shown).map((p, i) => (
                <FragmentWithTile key={p.id} showTile={!!tile && i === 5} cat={cat.image!} dept={cat.key}>
                  <li className="plp-item"><ProductCard id={p.id} priority={i < 4} /></li>
                </FragmentWithTile>
              ))}
            </ul>
            {shown < results.length && (
              <div className="mt-14 flex flex-col items-center gap-4">
                <p className="text-[14px] text-ink-2">מציג <span className="num">{shown}</span> מתוך <span className="num">{results.length}</span> מוצרים</p>
                <div className="w-56 h-0.5 bg-line" aria-hidden><div className="h-full bg-ink origin-right" style={{ transform: `scaleX(${shown / results.length})` }} /></div>
                <button className="btn btn-outline" onClick={() => setShown((s) => s + PAGE)}>טעינת מוצרים נוספים</button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center">
            <p className="text-2xl font-bold">לא נמצאו מוצרים</p>
            <p className="soft mt-2 text-ink-2">נסו להסיר חלק מהסינונים.</p>
            <button className="btn btn-primary mt-6" onClick={clearAll}>ניקוי כל הסינונים</button>
          </div>
        )}
      </div>

      {/* Mobile: filter sheet */}
      <Sheet open={sheet === 'filter'} onClose={() => setSheet(null)} side="bottom" labelledBy="filter-title" title={<>סינון{n > 0 && <span className="num text-ink-3 font-normal"> ({n})</span>}</>}
        footer={
          <div className="flex gap-3">
            <button className="btn btn-outline flex-1" onClick={clearAll} disabled={!n}>ניקוי</button>
            <button className="btn btn-primary flex-[2]" onClick={() => setSheet(null)}>הצגת <span className="num">{results.length}</span> מוצרים</button>
          </div>
        }>
        <div className="px-5">
          {allFacets.map((k, i) => (
            <details key={k} className="group border-b border-line" open={i < 2 || facetActive(k) > 0}>
              <summary className="flex items-center justify-between h-14 list-none cursor-pointer font-semibold">
                <span>{facetLabel(k)}{facetActive(k) > 0 && <span className="num ms-2 text-[13px] text-gali">({facetActive(k)})</span>}</span>
                <Icon name="down" className="size-5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="pb-5">{facetBody(k)}</div>
            </details>
          ))}
        </div>
      </Sheet>

      {/* Mobile: sort sheet */}
      <Sheet open={sheet === 'sort'} onClose={() => setSheet(null)} side="bottom" labelledBy="sort-title" title="מיון">
        <fieldset className="px-5 py-2">
          <legend className="sr-only">מיון מוצרים</legend>
          {SORTS.map((s) => (
            <label key={s.id} className="flex items-center justify-between h-14 border-b border-line last:border-0 cursor-pointer text-[16px]">
              {s.label}
              <input type="radio" name="sort" className="size-5 accent-[var(--color-ink)]" checked={f.sort === s.id} onChange={() => { update({ sort: s.id }); setSheet(null); }} />
            </label>
          ))}
        </fieldset>
      </Sheet>
    </div>
  );
}

function FragmentWithTile({ children, showTile, cat, dept }: { children: ReactNode; showTile: boolean; cat: string; dept: string }) {
  if (!showTile) return <>{children}</>;
  const to = ['women', 'men', 'girls', 'boys'].includes(dept) ? `/new?dept=${dept}` : '/new';
  return (
    <>
      <li className="plp-tile col-span-2 row-span-1 max-md:order-none">
        <a href={to} className="group relative block h-full min-h-[300px] overflow-hidden bg-paper-2">
          <img src={campaign(cat, 960)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover object-[50%_28%] transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
          <span className="absolute inset-x-0 bottom-0 p-5 lg:p-7 bg-gradient-to-t from-ink/60 to-transparent text-paper">
            <span className="display block text-[clamp(1.75rem,1rem+2vw,2.75rem)]">חדש העונה</span>
            <span className="mt-2 inline-flex items-center gap-2 text-[14px] font-semibold">זוג שני ב-59.90 ₪ · לקולקציה<Icon name="arrow" className="size-4" /></span>
          </span>
        </a>
      </li>
      {children}
    </>
  );
}

/** Desktop filter popover: unobtrusive trigger, instant apply, outside-click / Esc to close. */
function Popover({ label, active, wide, children }: { label: string; active: number; wide?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 h-10 px-3 text-[14px] font-medium rounded-[2px] transition-colors duration-150 ${open ? 'bg-paper-2' : 'hover:bg-paper-2'}`}>
        {label}
        {active > 0 && <span className="num grid place-items-center min-w-5 h-5 px-1 rounded-full bg-ink text-paper text-[11px]">{active}</span>}
        <Icon name="down" className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`popover absolute top-full right-0 mt-1 bg-paper p-4 shadow-[0_1px_0_var(--color-line),0_18px_40px_-12px_rgb(21_21_20/0.28)] z-10 ${wide ? 'w-[340px]' : 'w-[280px]'} max-h-[60vh] overflow-y-auto`}>
          {children}
        </div>
      )}
    </div>
  );
}

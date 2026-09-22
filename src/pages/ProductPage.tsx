import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { catalog, products, deptLabel, subcats, fmt, type Product } from '../data/catalog';
import { shipping, returns } from '../data/sizeCharts';
import { Gallery } from '../components/commerce/Gallery';
import { SizeGuide } from '../components/commerce/SizeGuide';
import { ProductCard, Price, PromoLabels, WishButton } from '../components/commerce/ProductCard';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Icon } from '../components/ui/Icon';
import { store } from '../store';
import NotFound from './NotFound';

type AddState = 'idle' | 'adding' | 'added';

function related(p: Product) {
  const sub = p.subcats[0];
  const same = catalog.filter((x) => x.id !== p.id && (sub ? x.subcats.includes(sub) : x.dept === p.dept));
  const fill = catalog.filter((x) => x.id !== p.id && x.dept === p.dept && !same.includes(x));
  const brand = catalog.filter((x) => x.id !== p.id && x.brand === p.brand);
  return { similar: [...same, ...fill].slice(0, 4), brand: brand.length >= 4 ? brand.slice(0, 4) : [] };
}

export default function ProductPage() {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const p = slug ? products[slug] : undefined;
  const v = p?.variants.find((x) => x.code === sp.get('color')) ?? p?.variants[0];
  const [size, setSize] = useState<string>();
  const [err, setErr] = useState(false);
  const [add, setAdd] = useState<AddState>('idle');
  const [guide, setGuide] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const atc = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSize(undefined); setErr(false); setAdd('idle'); }, [slug, v?.code]);
  useEffect(() => { if (p) document.title = `${p.name} – ${p.brand} | גלי (Concept)`; }, [p]);
  // Mobile sticky add-to-cart appears once the main button leaves the viewport
  useEffect(() => {
    const el = atc.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [p?.id]);

  const rel = useMemo(() => (p ? related(p) : { similar: [], brand: [] }), [p]);
  if (!p || !v) return <NotFound />;

  const sub = subcats.find((s) => p.subcats.includes(s.slug));
  const crumbs = [
    { label: 'ראשי', to: '/' },
    { label: deptLabel[p.dept], to: `/${p.dept}` },
    ...(sub ? [{ label: sub.label, to: `/category/${sub.slug}` }] : []),
    { label: p.name },
  ];
  const images = v.gallery.length ? v.gallery : [v.img];
  // Sizes come only from the real Gali listing data; nothing is invented.
  const hasSizes = v.sizes.length > 0;
  const soldOut = hasSizes && !v.sizes.some((s) => s.available);
  const canBuy = hasSizes && !soldOut;

  const addToBag = () => {
    if (!canBuy) return;
    if (!size || !v.sizes.some((s) => s.label === size && s.available)) {
      setErr(false);
      requestAnimationFrame(() => setErr(true)); // re-trigger the shake on repeated attempts
      sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sizesRef.current?.querySelector<HTMLElement>('input:not(:disabled)')?.focus({ preventScroll: true });
      return;
    }
    setAdd('adding');
    window.setTimeout(() => {
      store.addToBag(p.id, v.code, size);
      setAdd('added');
      window.setTimeout(() => setAdd('idle'), 1800);
    }, 320);
  };

  // render function (not a nested component) so the button keeps focus across state changes
  const addButton = (compact = false) => (
    <button type="button" onClick={addToBag} aria-live="polite" disabled={add === 'adding' || !canBuy}
      className={`atc btn btn-primary ${compact ? 'h-12 flex-1' : 'h-14 flex-1 text-[17px]'} ${add === 'added' ? '!bg-gali' : ''}`}>
      {add === 'adding' ? <span className="atc-spinner" aria-label="מוסיף לסל" /> : add === 'added' ? <><Icon name="check" className="size-5" />נוסף לסל</> : soldOut ? 'אזל מהמלאי' : !hasSizes ? 'לא זמין לרכישה באתר' : 'הוספה לסל'}
    </button>
  );

  return (
    <div className="pdp">
      <div className="shell pt-4 lg:pt-6">
        <Breadcrumbs items={crumbs} className="max-lg:hidden" />
        <div className="lg:mt-6 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12 gap-x-10 xl:gap-x-14">
          {/* Gallery ≈ 58% */}
          <div className="lg:col-span-7">
            <Gallery images={images} alt={`${p.brand} ${p.name}${v.color ? ` – ${v.color}` : ''}`} />
          </div>

          {/* Purchase panel */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] pt-5 lg:pt-0 pb-10">
              <Breadcrumbs items={crumbs.slice(0, -1)} className="lg:hidden mb-3" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="latin text-[12px] text-ink-2">{p.brand}</p>
                  <h1 className="mt-1.5 text-[clamp(1.6rem,1.2rem+1.2vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.01em]">{p.name}</h1>
                </div>
                <PromoLabels p={p} className="pt-1 shrink-0" />
              </div>
              <div className="mt-4"><Price p={p} size="lg" /></div>
              {p.was && <p className="mt-1 text-[14px] text-sale font-medium">חוסכים {fmt(p.was - p.price)} ₪</p>}
              {p.promo && <p className="soft mt-2 text-[15px] text-gali">{p.promo} על פריטי הקולקציה החדשה</p>}

              {/* Colour */}
              {p.variants.length > 1 || v.color ? (
                <fieldset className="mt-7">
                  <legend className="text-[14px]"><span className="font-semibold">צבע:</span> <span className="text-ink-2">{v.color}</span></legend>
                  {p.variants.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.variants.map((x) => (
                        <label key={x.code} className="cursor-pointer">
                          <input type="radio" name="color" className="peer sr-only" checked={x.code === v.code}
                            onChange={() => setSp({ color: x.code }, { replace: true, preventScrollReset: true })} />
                          <span className="block size-16 bg-[#efe9df] ring-1 ring-transparent ring-offset-2 ring-offset-paper peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-gali transition-shadow" title={x.color}>
                            <img src={x.img} alt={x.color} className="size-full object-contain mix-blend-multiply" />
                          </span>
                          <span className="sr-only">{x.color}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </fieldset>
              ) : null}

              {/* Size */}
              {hasSizes ? (
                <div ref={sizesRef} role="radiogroup" aria-labelledby="size-label" className="mt-7" aria-describedby={err ? 'size-err' : undefined}>
                  <div className="flex items-baseline justify-between">
                    <p id="size-label" className="text-[14px] font-semibold">מידה{size && <span className="font-normal text-ink-2">: <span className="num">{size}</span></span>}</p>
                    <button type="button" className="inline-flex items-center gap-1.5 text-[14px] underline underline-offset-4" onClick={() => setGuide(true)}>
                      <Icon name="ruler" className="size-4" />טבלת מידות
                    </button>
                  </div>
                  <div className={`mt-3 grid grid-cols-5 sm:grid-cols-6 gap-1.5 ${err ? 'shake' : ''}`}>
                    {v.sizes.map((s) => (
                      <label key={s.label} className={s.available ? 'cursor-pointer' : 'cursor-not-allowed'}>
                        <input type="radio" name="size" className="peer sr-only" disabled={!s.available} checked={size === s.label}
                          onChange={() => { setSize(s.label); setErr(false); }} aria-label={`מידה ${s.label}${s.available ? '' : ' – אזל מהמלאי'}`} />
                        <span className={`size-opt num grid place-items-center h-12 text-[15px] font-medium border transition-[background-color,color,border-color] duration-150
                          peer-checked:bg-ink peer-checked:text-paper peer-checked:border-ink peer-focus-visible:outline-2 peer-focus-visible:outline-gali peer-focus-visible:outline-offset-2
                          ${s.available ? 'border-ink/20 hover:border-ink' : 'border-line text-ink-3 line-through bg-paper-2'} ${err ? 'border-sale/60' : ''}`}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                  {err && <p id="size-err" role="alert" className="mt-2 text-[14px] font-medium text-sale">יש לבחור מידה לפני ההוספה לסל</p>}
                </div>
              ) : (
                <p className="mt-7 text-[14px] text-ink-2">אין כרגע מידע על מידות זמינות למוצר זה. ניתן לבדוק מלאי בסניפי גלי.</p>
              )}

              {/* Add to bag */}
              <div ref={atc} className="mt-6 flex gap-2">
                {addButton()}
                <WishButton id={p.id} className="!size-14 border border-ink/20 shrink-0" />
              </div>
              <p className="soft mt-3 text-[14px] text-ink-2">חברי Super Friends צוברים 10% מערך הקנייה.</p>

              {/* Service */}
              <ul className="mt-6 border-y border-line divide-y divide-line text-[14px]">
                <li className="flex items-center gap-3 py-3.5"><Icon name="truck" className="size-5 text-gali shrink-0" />משלוח חינם בקנייה מעל 199 ₪ · שליח עד הבית 24.90 ₪</li>
                <li className="flex items-center gap-3 py-3.5"><Icon name="returns" className="size-5 text-gali shrink-0" />החזרות ללא עלות בסניפים</li>
              </ul>

              {/* Details */}
              <div className="mt-2">
                <details className="group border-b border-line" open>
                  <summary className="flex items-center justify-between h-14 list-none cursor-pointer font-semibold">על המוצר<Icon name="down" className="size-5 transition-transform duration-200 group-open:rotate-180" /></summary>
                  <div className="pb-5 text-[15px] text-ink-2 leading-relaxed space-y-3">
                    {v.desc && <p>{v.desc}</p>}
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px]">
                      {v.material && <><dt className="text-ink-3">הרכב</dt><dd>{v.material}</dd></>}
                      {v.color && <><dt className="text-ink-3">צבע</dt><dd>{v.color}</dd></>}
                      <dt className="text-ink-3">מותג</dt><dd dir="ltr" className="text-right">{p.brand}</dd>
                      {(v.skuLabel || v.sku) && <><dt className="text-ink-3">מק״ט</dt><dd className="num">{v.skuLabel || v.sku}</dd></>}
                    </dl>
                  </div>
                </details>
                <details className="group border-b border-line">
                  <summary className="flex items-center justify-between h-14 list-none cursor-pointer font-semibold">משלוחים והחזרות<Icon name="down" className="size-5 transition-transform duration-200 group-open:rotate-180" /></summary>
                  <ul className="pb-5 text-[15px] text-ink-2 space-y-1.5 list-disc ps-5">
                    {[...shipping, ...returns].map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related — reuses the shared product card */}
      {rel.similar.length > 0 && (
        <section aria-labelledby="rel-title" className="shell pt-16 lg:pt-24 pb-10">
          <SectionHeading id="rel-title" title={sub ? `עוד ב${sub.label}` : `עוד ל${deptLabel[p.dept]}`}
            link={{ to: sub ? `/category/${sub.slug}` : `/${p.dept}`, label: 'לכל הקטגוריה' }} className="mb-8" />
          <ul className="grid grid-flow-col auto-cols-[46%] md:auto-cols-auto md:grid-flow-row md:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8 overflow-x-auto md:overflow-visible snap-x no-scrollbar -mx-[var(--gutter)] px-[var(--gutter)] md:mx-0 md:px-0">
            {rel.similar.map((x) => <li key={x.id} className="snap-start"><ProductCard id={x.id} /></li>)}
          </ul>
        </section>
      )}
      {rel.brand.length > 0 && (
        <section aria-labelledby="brand-title" className="shell pt-10 pb-24 lg:pb-32">
          <SectionHeading id="brand-title" title={<>עוד מ-<span dir="ltr">{p.brand}</span></>} className="mb-8" />
          <ul className="grid grid-flow-col auto-cols-[46%] md:auto-cols-auto md:grid-flow-row md:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-8 overflow-x-auto md:overflow-visible snap-x no-scrollbar -mx-[var(--gutter)] px-[var(--gutter)] md:mx-0 md:px-0">
            {rel.brand.map((x) => <li key={x.id} className="snap-start"><ProductCard id={x.id} /></li>)}
          </ul>
        </section>
      )}

      {/* Mobile sticky add-to-cart */}
      <div className={`mobile-atc lg:hidden fixed inset-x-0 bottom-0 z-40 bg-paper border-t border-line px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] ${showBar ? 'is-on' : ''}`}
        aria-hidden={!showBar} inert={!showBar}>
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[13px] truncate">{p.name}</p>
            <p className={`num text-[15px] font-bold ${p.was ? 'text-sale' : ''}`}>{fmt(p.price)} ₪{size && <span className="font-normal text-ink-2"> · מידה {size}</span>}</p>
          </div>
          {addButton(true)}
        </div>
      </div>

      <SizeGuide open={guide} onClose={() => setGuide(false)} dept={p.dept} selected={size} />
    </div>
  );
}
